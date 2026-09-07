/**
 * ISO 20022 Financial Messaging Engine for CTS
 * Formats XML standards:
 * - pacs.008.001.10 (Financial Institutional Customer Credit Transfer)
 * - pacs.002.001.12 (Payment Status Report / Cheque Return)
 */

function generatePacs008Xml({ settlement, cheques = [] }) {
  const msgId = `CTS/SETTL/${settlement.id.slice(0, 8)}/${Date.now()}`;
  const creationDate = new Date().toISOString();
  const totalAmount = Number(settlement.netAmount).toFixed(2);
  const nbOfTxs = cheques.length || 1;

  const bankAName = settlement.bankA?.name || "Surat Local Bank";
  const bankAIfsc = settlement.bankA?.ifsc || "SBIN0001234";
  const bankBName = settlement.bankB?.name || "Horizon Digital Bank";
  const bankBIfsc = settlement.bankB?.ifsc || "HDFC0005678";

  let txListXml = "";
  if (cheques.length > 0) {
    txListXml = cheques
      .map(
        (c, idx) => `
      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>CTS-${c.chequeNumber}-${c.id.slice(0, 6)}</EndToEndId>
          <TxId>TX-${idx + 1}-${c.id.slice(0, 8)}</TxId>
        </PmtId>
        <IntrBkSttlmAmt Ccy="INR">${Number(c.amount).toFixed(2)}</IntrBkSttlmAmt>
        <DbtrAgt>
          <FinInstnId>
            <ClrSysMmbId>
              <MmbId>${c.draweeBank?.ifsc || bankBIfsc}</MmbId>
            </ClrSysMmbId>
            <Nm>${c.draweeBank?.name || bankBName}</Nm>
          </FinInstnId>
        </DbtrAgt>
        <CdtrAgt>
          <FinInstnId>
            <ClrSysMmbId>
              <MmbId>${c.presentingBank?.ifsc || bankAIfsc}</MmbId>
            </ClrSysMmbId>
            <Nm>${c.presentingBank?.name || bankAName}</Nm>
          </FinInstnId>
        </CdtrAgt>
        <DbtrAcct>
          <Id><Othr><Id>${c.accountNumber}</Id></Othr></Id>
        </DbtrAcct>
        <Cdtr>
          <Nm>${escapeXml(c.payeeName)}</Nm>
        </Cdtr>
        <RmtInf>
          <Ustrd>Cheque Clearance Truncation Ref: ${c.chequeNumber}</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>`
      )
      .join("\n");
  } else {
    txListXml = `
      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>CTS-NET-SETTL-${settlement.id.slice(0, 8)}</EndToEndId>
          <TxId>TX-NET-01</TxId>
        </PmtId>
        <IntrBkSttlmAmt Ccy="INR">${totalAmount}</IntrBkSttlmAmt>
        <DbtrAgt>
          <FinInstnId>
            <ClrSysMmbId><MmbId>${settlement.direction === "A_TO_B" ? bankAIfsc : bankBIfsc}</MmbId></ClrSysMmbId>
            <Nm>${settlement.direction === "A_TO_B" ? bankAName : bankBName}</Nm>
          </FinInstnId>
        </DbtrAgt>
        <CdtrAgt>
          <FinInstnId>
            <ClrSysMmbId><MmbId>${settlement.direction === "A_TO_B" ? bankBIfsc : bankAIfsc}</MmbId></ClrSysMmbId>
            <Nm>${settlement.direction === "A_TO_B" ? bankBName : bankAName}</Nm>
          </FinInstnId>
        </CdtrAgt>
        <RmtInf>
          <Ustrd>Multilateral Net Settlement Clearing Batch</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${creationDate}</CreDtTm>
      <NbOfTxs>${nbOfTxs}</NbOfTxs>
      <TtlIntrBkSttlmAmt Ccy="INR">${totalAmount}</TtlIntrBkSttlmAmt>
      <IntrBkSttlmDt>${creationDate.slice(0, 10)}</IntrBkSttlmDt>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys>
          <Prtry>CTS-NPCI</Prtry>
        </ClrSys>
      </SttlmInf>
    </GrpHdr>
    ${txListXml}
  </FIToFICstmrCdtTrf>
</Document>`;
}

function generatePacs002Xml({ cheque }) {
  const msgId = `CTS/RET/${cheque.id.slice(0, 8)}/${Date.now()}`;
  const creationDate = new Date().toISOString();

  const isoReasonMap = {
    "Insufficient funds": "AM04",
    "Signature mismatch": "AG01",
    "Account closed": "AC04",
    "Stale/post-dated cheque": "DT01",
    "Amount in words/figures mismatch": "AM02",
    "Maker-Checker verification rejected": "MS03",
  };

  const isoCode = isoReasonMap[cheque.returnReason] || "NARR";

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.12">
  <FIToFIPmtStsRpt>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${creationDate}</CreDtTm>
    </GrpHdr>
    <TxInfAndSts>
      <OrgnlEndToEndId>CTS-${cheque.chequeNumber}</OrgnlEndToEndId>
      <TxSts>RJCT</TxSts>
      <StsRsnInf>
        <Rsn>
          <Cd>${isoCode}</Cd>
        </Rsn>
        <AddtlInf>${escapeXml(cheque.returnReason || "Cheque return initiated by drawee")}</AddtlInf>
      </StsRsnInf>
      <OrgnlTxRef>
        <IntrBkSttlmAmt Ccy="INR">${Number(cheque.amount).toFixed(2)}</IntrBkSttlmAmt>
        <DbtrAgt>
          <FinInstnId><ClrSysMmbId><MmbId>${cheque.draweeBank?.ifsc}</MmbId></ClrSysMmbId></FinInstnId>
        </DbtrAgt>
        <CdtrAgt>
          <FinInstnId><ClrSysMmbId><MmbId>${cheque.presentingBank?.ifsc}</MmbId></ClrSysMmbId></FinInstnId>
        </CdtrAgt>
      </OrgnlTxRef>
    </TxInfAndSts>
  </FIToFIPmtStsRpt>
</Document>`;
}

function escapeXml(unsafe) {
  return String(unsafe || "")
    .replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "&": return "&amp;";
        case "'": return "&apos;";
        case '"': return "&quot;";
        default: return c;
      }
    });
}

module.exports = {
  generatePacs008Xml,
  generatePacs002Xml,
};
