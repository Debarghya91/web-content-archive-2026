/* ISO 20022 Mapping Workbench (Feature 3).
   Free workbench: pick any source and target message, map fields with a
   transformation, validate, and generate the target XML.
   Guided exercise: map a pain.001 (EUR 25,000) into a pacs.008.
   All data is synthetic and for education only. No server,
   no real banking systems. Deterministic: same mappings always give the
   same validation results, the same XML and the same score. */
(function(){
  "use strict";
  var P = window.PFFeatures;
  var FEATURE_ID = "mapping-workbench";
  var TOTAL = 100;

  /* ---------- validation helpers ---------- */
  var CURRENCIES = ["AED","AUD","CAD","CHF","CNY","EUR","GBP","HKD","INR",
    "JPY","NZD","SGD","USD","ZAR"];
  var IBAN_LEN = {AT:20, BE:16, CH:21, CZ:24, DE:22, DK:18, ES:24, FI:18,
    FR:27, GB:22, HU:28, IE:22, IT:27, LU:20, NL:18, NO:15, PL:28, PT:25,
    SE:24, SK:24};

  function validDate(v){
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || "");
    if(!m) return false;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 &&
      d.getDate() === +m[3];
  }
  function validDateTime(v){
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(v || "");
    if(!m || !validDate(m[1] + "-" + m[2] + "-" + m[3])) return false;
    if(+m[4] > 23 || +m[5] > 59) return false;
    if(m[6] !== undefined && +m[6] > 59) return false;
    return true;
  }
  function ibanValid(v){
    var s = String(v || "").replace(/\s+/g, "").toUpperCase();
    if(!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false;
    var want = IBAN_LEN[s.slice(0, 2)];
    if(want && s.length !== want) return false;
    var rearr = s.slice(4) + s.slice(0, 4);
    var num = "";
    for(var i = 0; i < rearr.length; i++){
      var ch = rearr[i];
      num += /[0-9]/.test(ch) ? ch : String(ch.charCodeAt(0) - 55);
    }
    var mod = 0;
    for(var j = 0; j < num.length; j++){
      mod = (mod * 10 + parseInt(num[j], 10)) % 97;
    }
    return mod === 1;
  }
  function bicValid(v){
    return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(String(v || ""));
  }

  /* Check a resolved value against the target field type.
     Returns an error string, or null when the value is valid. */
  function validateValue(value, ccy, tf){
    var v = (value == null ? "" : String(value));
    if(tf.type === "amount"){
      if(!/^\d+(\.\d{1,2})?$/.test(v))
        return "amount '" + v + "' is not a valid decimal. Use digits with up to two decimal places, for example 25000.00";
      if(!ccy)
        return "amount has no currency. An amount in ISO 20022 needs a currency code, for example EUR";
      if(CURRENCIES.indexOf(ccy) === -1)
        return "currency '" + ccy + "' is not a recognised ISO 4217 currency code";
      return null;
    }
    if(tf.type === "iban"){
      if(!ibanValid(v))
        return "IBAN '" + v + "' is not a valid IBAN. Check the country code, the two check digits and the length for that country";
      return null;
    }
    if(tf.type === "bic"){
      if(!bicValid(v))
        return "BIC '" + v + "' is not a valid BIC. A BIC is 8 or 11 characters: 4 bank code, 2 country code, 2 location code, optional 3 branch code";
      return null;
    }
    if(tf.type === "date"){
      if(!validDate(v))
        return "date '" + v + "' is not a valid ISO 8601 date. Use YYYY-MM-DD, for example 2026-11-09";
      return null;
    }
    if(tf.type === "datetime"){
      if(!validDateTime(v))
        return "date and time '" + v + "' is not a valid ISO 8601 date and time. Use YYYY-MM-DDTHH:MM:SS, for example 2026-11-06T09:15:00";
      return null;
    }
    if(tf.type === "uetr"){
      if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v))
        return "UETR '" + v + "' is not a valid UUID. Use the form 8-4-4-4-12 hex characters";
      return null;
    }
    if(tf.type === "count"){
      if(!/^\d+$/.test(v))
        return "count '" + v + "' is not a whole number";
      return null;
    }
    if(tf.type === "code"){
      if(!/^[A-Z0-9]{2,4}$/.test(v))
        return "code '" + v + "' must be 2 to 4 upper case letters or digits, for example TRF or ACSC";
      return null;
    }
    /* text */
    if(v.trim() === "") return "value is empty";
    var max = tf.maxLen || 140;
    if(v.length > max)
      return "value is " + v.length + " characters, longer than the " + max + " character limit for " + tf.path;
    return null;
  }

  /* Format change: type-aware normalisation of a source value. */
  function formatValue(f, v){
    var s = String(v == null ? "" : v);
    if(f.type === "amount"){
      var n = parseFloat(s);
      if(!isNaN(n)) return n.toFixed(2);
      return s;
    }
    if(f.type === "date"){
      var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
      if(m) return m[3] + "-" + m[2] + "-" + m[1];
      return s;
    }
    if(f.type === "iban") return s.replace(/\s+/g, "").toUpperCase();
    if(f.type === "bic") return s.toUpperCase();
    if(f.type === "text") return s.trim().replace(/\s+/g, " ");
    return s.trim();
  }

  /* ---------- message definitions ----------
     path is the element chain under the message root, so the XML path is
     [root].concat(path.split(".")). value is the sample value used in the
     source XML and as the default when the learner maps the field. */
  function F(id, path, label, type, req, value, extra){
    var f = {id: id, path: path, label: label, type: type, req: !!req, value: value};
    if(extra){ for(var k in extra) f[k] = extra[k]; }
    return f;
  }
  var MESSAGES = {
    pain001: {
      id: "pain001", name: "pain.001", version: "pain.001.001.03",
      xsd: "pain.001.001.03", root: "CstmrCdtTrfInitn",
      title: "Customer Credit Transfer Initiation",
      purpose: "A customer (corporate or individual) instructs its bank to make a credit transfer to a creditor.",
      fields: [
        F("msg-id", "GrpHdr.MsgId", "Message identification", "text", true, "PAIN001-2026-1106-001", {maxLen: 35}),
        F("cre-dttm", "GrpHdr.CreDtTm", "Creation date and time", "datetime", true, "2026-11-06T09:15:00"),
        F("nb-of-txs", "GrpHdr.NbOfTxs", "Number of transactions", "count", true, "1"),
        F("pmtinf-id", "PmtInf.PmtInfId", "Payment information identification", "text", true, "PMTINF-2026-1106-001", {maxLen: 35}),
        F("pmt-mtd", "PmtInf.PmtMtd", "Payment method", "code", true, "TRF"),
        F("reqd-exctn-dt", "PmtInf.ReqdExctnDt", "Requested execution date", "date", true, "2026-11-09"),
        F("dbtr-nm", "PmtInf.Dbtr.Nm", "Debtor name", "text", true, "Meridian Trading Ltd"),
        F("dbtr-iban", "PmtInf.DbtrAcct.Id.IBAN", "Debtor account IBAN", "iban", true, "GB29NWBK60161331926819"),
        F("dbtr-bic", "PmtInf.DbtrAgt.FinInstnId.BIC", "Debtor agent BIC", "bic", true, "NWBKGB2L"),
        F("end-to-end-id", "PmtInf.CdtTrfTxInf.PmtId.EndToEndId", "End to end identification", "text", true, "MERIDIAN-2026-1106-0147", {maxLen: 35}),
        F("instd-amt", "PmtInf.CdtTrfTxInf.Amt.InstdAmt", "Instructed amount", "amount", true, "25000.00", {ccy: "EUR"}),
        F("cdtr-bic", "PmtInf.CdtTrfTxInf.CdtrAgt.FinInstnId.BIC", "Creditor agent BIC", "bic", true, "DEUTDEFF"),
        F("cdtr-nm", "PmtInf.CdtTrfTxInf.Cdtr.Nm", "Creditor name", "text", true, "Tan and Lee Supplies Pte Ltd"),
        F("cdtr-iban", "PmtInf.CdtTrfTxInf.CdtrAcct.Id.IBAN", "Creditor account IBAN", "iban", true, "DE89370400440532013000"),
        F("rmt-inf", "PmtInf.CdtTrfTxInf.RmtInf.Ustrd", "Remittance information (unstructured)", "text", false, "Invoice INV-2026-0841, machinery parts")
      ]
    },
    pacs008: {
      id: "pacs008", name: "pacs.008", version: "pacs.008.001.08",
      xsd: "pacs.008.001.08", root: "FIToFICstmrCdtTrf",
      title: "FI to FI Customer Credit Transfer",
      purpose: "One financial institution instructs another to move a customer payment onward, carrying the debtor and creditor details.",
      fields: [
        F("msg-id", "GrpHdr.MsgId", "Message identification", "text", true, "PACS008-2026-1106-0147", {maxLen: 35}),
        F("cre-dttm", "GrpHdr.CreDtTm", "Creation date and time", "datetime", true, "2026-11-06T09:16:00"),
        F("uetr", "GrpHdr.UETR", "Unique end to end transaction reference", "uetr", false, "a41f2c90-7b3e-4d18-9c52-1e8f6a3d0471"),
        F("nb-of-txs", "GrpHdr.NbOfTxs", "Number of transactions", "count", true, "1"),
        F("sttlm-mtd", "GrpHdr.SttlmInf.SttlmMtd", "Settlement method", "code", false, "CLRG"),
        F("instr-id", "CdtTrfTxInf.PmtId.InstrId", "Instruction identification", "text", false, "PACS008-2026-1106-0147", {maxLen: 35}),
        F("end-to-end-id", "CdtTrfTxInf.PmtId.EndToEndId", "End to end identification", "text", true, "MERIDIAN-2026-1106-0147", {maxLen: 35}),
        F("intr-bk-sttlm-amt", "CdtTrfTxInf.IntrBkSttlmAmt", "Interbank settlement amount", "amount", true, "25000.00", {ccy: "EUR"}),
        F("instd-amt", "CdtTrfTxInf.InstdAmt", "Instructed amount", "amount", false, "25000.00", {ccy: "EUR"}),
        F("dbtr-nm", "CdtTrfTxInf.Dbtr.Nm", "Debtor name", "text", true, "Meridian Trading Ltd"),
        F("dbtr-iban", "CdtTrfTxInf.DbtrAcct.Id.IBAN", "Debtor account IBAN", "iban", true, "GB29NWBK60161331926819"),
        F("dbtr-bic", "CdtTrfTxInf.DbtrAgt.FinInstnId.BIC", "Debtor agent BIC", "bic", true, "NWBKGB2L"),
        F("cdtr-bic", "CdtTrfTxInf.CdtrAgt.FinInstnId.BIC", "Creditor agent BIC", "bic", true, "DEUTDEFF"),
        F("cdtr-nm", "CdtTrfTxInf.Cdtr.Nm", "Creditor name", "text", true, "Tan and Lee Supplies Pte Ltd"),
        F("cdtr-iban", "CdtTrfTxInf.CdtrAcct.Id.IBAN", "Creditor account IBAN", "iban", true, "DE89370400440532013000"),
        F("chrg-br", "CdtTrfTxInf.ChrgBr", "Charge bearer", "code", false, "SHAR"),
        F("rmt-inf", "CdtTrfTxInf.RmtInf.Ustrd", "Remittance information (unstructured)", "text", false, "Invoice INV-2026-0841, machinery parts")
      ]
    },
    pacs002: {
      id: "pacs002", name: "pacs.002", version: "pacs.002.001.03",
      xsd: "pacs.002.001.03", root: "FIToFIPmtStsRpt",
      title: "FI to FI Payment Status Report",
      purpose: "A financial institution reports the status of an earlier payment instruction, for example accepted or rejected.",
      fields: [
        F("msg-id", "GrpHdr.MsgId", "Message identification", "text", true, "PACS002-2026-1106-0201", {maxLen: 35}),
        F("cre-dttm", "GrpHdr.CreDtTm", "Creation date and time", "datetime", true, "2026-11-06T10:02:00"),
        F("orgnl-msg-id", "OrgnlGrpInfAndSts.OrgnlMsgId", "Original message identification", "text", true, "PACS008-2026-1106-0147", {maxLen: 35}),
        F("grp-sts", "OrgnlGrpInfAndSts.GrpSts", "Group status", "code", true, "ACCP"),
        F("orgnl-end-to-end-id", "TxInfAndSts.OrgnlEndToEndId", "Original end to end identification", "text", true, "MERIDIAN-2026-1106-0147", {maxLen: 35}),
        F("tx-sts", "TxInfAndSts.TxSts", "Transaction status", "code", true, "ACSC"),
        F("rsn-cd", "TxInfAndSts.StsRsnInf.Rsn.Cd", "Status reason code", "code", false, "AC01")
      ]
    },
    pacs004: {
      id: "pacs004", name: "pacs.004", version: "pacs.004.001.02",
      xsd: "pacs.004.001.02", root: "PmtRtr",
      title: "Payment Return",
      purpose: "A financial institution returns a payment that cannot be applied, with the returned amount and a return reason code.",
      fields: [
        F("msg-id", "GrpHdr.MsgId", "Message identification", "text", true, "PACS004-2026-1106-0301", {maxLen: 35}),
        F("cre-dttm", "GrpHdr.CreDtTm", "Creation date and time", "datetime", true, "2026-11-06T11:20:00"),
        F("orgnl-msg-id", "OrgnlGrpInf.OrgnlMsgId", "Original message identification", "text", true, "PACS008-2026-1106-0147", {maxLen: 35}),
        F("orgnl-end-to-end-id", "TxInf.OrgnlEndToEndId", "Original end to end identification", "text", true, "MERIDIAN-2026-1106-0147", {maxLen: 35}),
        F("rtrd-intr-bk-sttlm-amt", "TxInf.RtrdIntrBkSttlmAmt", "Returned interbank settlement amount", "amount", true, "25000.00", {ccy: "EUR"}),
        F("rtrd-instd-amt", "TxInf.RtrdInstdAmt", "Returned instructed amount", "amount", false, "25000.00", {ccy: "EUR"}),
        F("rsn-cd", "TxInf.RtrRsnInf.Rsn.Cd", "Return reason code", "code", true, "AC04"),
        F("rtrd-dbtr-iban", "TxInf.RtrdDbtrAcct.Id.IBAN", "Returned debtor account IBAN", "iban", false, "GB29NWBK60161331926819")
      ]
    },
    pain002: {
      id: "pain002", name: "pain.002", version: "pain.002.001.03",
      xsd: "pain.002.001.03", root: "CstmrPmtStsRpt",
      title: "Customer Payment Status Report",
      purpose: "A bank tells its customer the status of a payment instruction the customer sent earlier.",
      fields: [
        F("msg-id", "GrpHdr.MsgId", "Message identification", "text", true, "PAIN002-2026-1106-0401", {maxLen: 35}),
        F("cre-dttm", "GrpHdr.CreDtTm", "Creation date and time", "datetime", true, "2026-11-06T10:05:00"),
        F("orgnl-msg-id", "OrgnlGrpInfAndSts.OrgnlMsgId", "Original message identification", "text", true, "PAIN001-2026-1106-001", {maxLen: 35}),
        F("grp-sts", "OrgnlGrpInfAndSts.GrpSts", "Group status", "code", true, "ACCP"),
        F("orgnl-pmtinf-id", "OrgnlPmtInfAndSts.OrgnlPmtInfId", "Original payment information identification", "text", true, "PMTINF-2026-1106-001", {maxLen: 35}),
        F("orgnl-end-to-end-id", "OrgnlPmtInfAndSts.TxInfAndSts.OrgnlEndToEndId", "Original end to end identification", "text", false, "MERIDIAN-2026-1106-0147", {maxLen: 35}),
        F("tx-sts", "OrgnlPmtInfAndSts.TxInfAndSts.TxSts", "Transaction status", "code", true, "ACSC"),
        F("rsn-cd", "OrgnlPmtInfAndSts.TxInfAndSts.StsRsnInf.Rsn.Cd", "Status reason code", "code", false, "AC01")
      ]
    },
    camt053: {
      id: "camt053", name: "camt.053", version: "camt.053.001.02",
      xsd: "camt.053.001.02", root: "BkToCstmrStmt",
      title: "Bank to Customer Statement",
      purpose: "A bank sends an account statement with balances and booked entries for a period.",
      fields: [
        F("msg-id", "GrpHdr.MsgId", "Message identification", "text", true, "CAMT053-2026-1106-0501", {maxLen: 35}),
        F("cre-dttm", "GrpHdr.CreDtTm", "Creation date and time", "datetime", true, "2026-11-06T18:00:00"),
        F("stmt-id", "Stmt.Id", "Statement identification", "text", true, "STMT-2026-1106-001", {maxLen: 35}),
        F("stmt-cre-dttm", "Stmt.CreDtTm", "Statement creation date and time", "datetime", true, "2026-11-06T18:00:00"),
        F("acct-iban", "Stmt.Acct.Id.IBAN", "Account IBAN", "iban", true, "GB29NWBK60161331926819"),
        F("bal-cd", "Stmt.Bal.Tp.CdOrPrtry.Cd", "Balance type code", "code", true, "OPBD"),
        F("bal-amt", "Stmt.Bal.Amt", "Balance amount", "amount", true, "152000.00", {ccy: "GBP"}),
        F("ntry-amt", "Stmt.Ntry.Amt", "Entry amount", "amount", true, "25000.00", {ccy: "EUR"}),
        F("ntry-cdt-dbt", "Stmt.Ntry.CdtDbtInd", "Credit or debit indicator", "code", true, "DBIT"),
        F("ntry-sts", "Stmt.Ntry.Sts", "Entry status", "code", true, "BOOK"),
        F("ntry-rmt", "Stmt.Ntry.NtryDtls.TxDtls.RmtInf.Ustrd", "Entry remittance information", "text", false, "Invoice INV-2026-0841, machinery parts")
      ]
    },
    camt054: {
      id: "camt054", name: "camt.054", version: "camt.054.001.02",
      xsd: "camt.054.001.02", root: "BkToCstmrDbtCdtNtfctn",
      title: "Bank to Customer Debit Credit Notification",
      purpose: "A bank notifies its customer of a single debit or credit entry on the account.",
      fields: [
        F("msg-id", "GrpHdr.MsgId", "Message identification", "text", true, "CAMT054-2026-1106-0601", {maxLen: 35}),
        F("cre-dttm", "GrpHdr.CreDtTm", "Creation date and time", "datetime", true, "2026-11-06T09:20:00"),
        F("ntfctn-id", "Ntfctn.Id", "Notification identification", "text", true, "NTFCTN-2026-1106-001", {maxLen: 35}),
        F("ntfctn-cre-dttm", "Ntfctn.CreDtTm", "Notification creation date and time", "datetime", true, "2026-11-06T09:20:00"),
        F("acct-iban", "Ntfctn.Acct.Id.IBAN", "Account IBAN", "iban", true, "DE89370400440532013000"),
        F("ntry-amt", "Ntfctn.Ntry.Amt", "Entry amount", "amount", true, "25000.00", {ccy: "EUR"}),
        F("ntry-cdt-dbt", "Ntfctn.Ntry.CdtDbtInd", "Credit or debit indicator", "code", true, "CRDT"),
        F("ntry-sts", "Ntfctn.Ntry.Sts", "Entry status", "code", true, "BOOK"),
        F("ntry-rmt", "Ntfctn.Ntry.NtryDtls.TxDtls.RmtInf.Ustrd", "Entry remittance information", "text", false, "Invoice INV-2026-0841, machinery parts")
      ]
    }
  };
  var MESSAGE_ORDER = ["pain001", "pacs008", "pacs002", "pacs004", "pain002", "camt053", "camt054"];

  function fieldById(msg, id){
    for(var i = 0; i < msg.fields.length; i++){
      if(msg.fields[i].id === id) return msg.fields[i];
    }
    return null;
  }
  function sampleValues(msg){
    var out = {};
    msg.fields.forEach(function(f){
      out[f.id] = {value: f.value, ccy: f.ccy || null};
    });
    return out;
  }

  /* ---------- XML building ---------- */
  function insertInto(tree, parts, leaf){
    var node = tree;
    for(var i = 0; i < parts.length - 1; i++){
      if(!node[parts[i]]) node[parts[i]] = {};
      node = node[parts[i]];
    }
    node[parts[parts.length - 1]] = leaf;
  }
  function renderTree(node, depth){
    var lines = [];
    var pad = "";
    for(var i = 0; i < depth; i++) pad += "  ";
    Object.keys(node).forEach(function(key){
      var child = node[key];
      if(child && typeof child === "object" && ("$v" in child)){
        var attr = (child.$c ? ' Ccy="' + P.esc(child.$c) + '"' : "");
        lines.push(pad + "<" + key + attr + ">" + P.esc(child.$v) + "</" + key + ">");
      } else {
        lines.push(pad + "<" + key + ">");
        lines.push(renderTree(child, depth + 1));
        lines.push(pad + "</" + key + ">");
      }
    });
    return lines.join("\n");
  }
  function buildXml(msg, values){
    var tree = {};
    msg.fields.forEach(function(f){
      var v = values[f.id];
      if(!v || v.value === "" || v.value == null) return;
      var parts = [msg.root].concat(f.path.split("."));
      insertInto(tree, parts, {$v: String(v.value), $c: v.ccy || null});
    });
    var lines = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<Document xmlns="urn:iso:std:iso:20022:tech:xsd:' + msg.xsd + '">'];
    var body = renderTree(tree, 1);
    if(body) lines.push(body);
    lines.push("</Document>");
    return lines.join("\n");
  }

  var TRANSFORM_LABELS = {
    direct: "Direct copy",
    format: "Format change",
    concat: "Concatenation",
    constant: "Constant value"
  };

  /* ---------- mapping engine (one instance per workbench) ---------- */
  function createMapper(cfg){
    var state = {
      sourceId: cfg.fixedSource || "pain001",
      targetId: cfg.fixedTarget || "pacs008",
      values: {},   /* msgId -> {fieldId: {value, ccy}} (edited source values) */
      mappings: [], /* {sourceId, targetId, transform, secondSourceId, constant} */
      selSource: null,
      selTarget: null
    };
    function $(id){ return P.el(cfg.prefix + "-" + id); }
    function srcMsg(){ return MESSAGES[state.sourceId]; }
    function tgtMsg(){ return MESSAGES[state.targetId]; }

    function getValue(fieldId){
      var f = fieldById(srcMsg(), fieldId);
      var per = state.values[state.sourceId] || {};
      if(per[fieldId]) return per[fieldId];
      return {value: f ? f.value : "", ccy: f ? (f.ccy || null) : null};
    }
    function setValue(fieldId, value){
      var f = fieldById(srcMsg(), fieldId);
      if(!f) return;
      if(!state.values[state.sourceId]) state.values[state.sourceId] = {};
      state.values[state.sourceId][fieldId] = {value: value, ccy: f.ccy || null};
    }

    function resolveMapping(m){
      if(m.transform === "constant") return {value: m.constant || "", ccy: null};
      var s1 = fieldById(srcMsg(), m.sourceId);
      var v1 = getValue(m.sourceId);
      if(m.transform === "concat"){
        var v2 = getValue(m.secondSourceId);
        return {value: (v1.value || "") + " " + (v2.value || ""), ccy: null};
      }
      if(m.transform === "format")
        return {value: formatValue(s1, v1.value), ccy: v1.ccy || null};
      return {value: v1.value, ccy: v1.ccy || null};
    }

    /* Required target groups: each group is a list of acceptable target
       field ids; at least one of the group must be mapped. */
    function requiredGroups(){
      if(cfg.requiredGroups) return cfg.requiredGroups();
      return tgtMsg().fields.filter(function(f){ return f.req; })
        .map(function(f){ return [f.id]; });
    }

    function validateAll(){
      var problems = [];
      var warnings = [];
      var src = srcMsg(), tgt = tgtMsg();
      var mappedTargets = {};
      var mappedSources = {};
      state.mappings.forEach(function(m){
        mappedTargets[m.targetId] = true;
        mappedSources[m.sourceId] = true;
      });
      requiredGroups().forEach(function(group){
        var ok = group.some(function(id){ return mappedTargets[id]; });
        if(!ok){
          var names = group.map(function(id){
            var f = fieldById(tgt, id);
            return f ? f.path : id;
          }).join(" or ");
          problems.push("Required target field unmapped: " + names);
        }
      });
      src.fields.forEach(function(f){
        if(!mappedSources[f.id])
          warnings.push("Source field not used yet: " + f.path + " (" + f.label + ")");
      });
      state.mappings.forEach(function(m){
        var sf = fieldById(src, m.sourceId);
        var tf = fieldById(tgt, m.targetId);
        if(!sf || !tf) return;
        if(m.transform !== "constant"){
          if(m.transform === "concat"){
            if(tf.type !== "text")
              problems.push("Type mismatch: concatenation produces text, but " + tf.path + " needs " + tf.type);
          } else if(sf.type !== tf.type && !(sf.type === "text" && tf.type === "code")){
            problems.push("Type mismatch: " + sf.path + " is " + sf.type + ", but " + tf.path + " needs " + tf.type);
          }
        }
        var r = resolveMapping(m);
        var err = validateValue(r.value, r.ccy, tf);
        if(err) problems.push("Invalid value for " + tf.path + ": " + err);
      });
      return {problems: problems, warnings: warnings};
    }

    function validationHtml(v){
      var html = "";
      if(v.problems.length){
        html += "<b>Validation found " + v.problems.length + " problem" +
          (v.problems.length === 1 ? "" : "s") + ".</b><ul>" +
          v.problems.map(function(p){ return "<li>" + P.esc(p) + "</li>"; }).join("") + "</ul>";
      } else if(v.warnings.length){
        html += "<b>No problems. " + v.warnings.length + " note" +
          (v.warnings.length === 1 ? "" : "s") + " to review.</b><ul>" +
          v.warnings.map(function(w){ return "<li>" + P.esc(w) + "</li>"; }).join("") + "</ul>";
      } else {
        html += "<b>All checks passed.</b> Every required target field is mapped and every mapped value is valid.";
      }
      return html;
    }

    /* ----- rendering ----- */
    function renderSource(){
      var msg = srcMsg();
      var title = $("source-title");
      if(title) title.textContent = "Source: " + msg.name + " (" + msg.title + ")";
      var xml = $("source-xml");
      if(xml){
        var vals = {};
        msg.fields.forEach(function(f){
          vals[f.id] = getValue(f.id);
        });
        xml.textContent = buildXml(msg, vals);
      }
      var list = $("source-list");
      if(!list) return;
      var html = "";
      msg.fields.forEach(function(f){
        var v = getValue(f.id);
        var sel = state.selSource === f.id ? " sel" : "";
        html += '<div class="mw-field' + sel + '" data-field-id="' + f.id + '" tabindex="0" role="button">' +
          '<div class="mw-field-top"><code>' + P.esc(f.path) + '</code>' +
          '<span class="pf-tag">' + f.type + '</span>' +
          (f.req ? '<span class="pf-tag amber">Required</span>' : '<span class="pf-tag grey">Optional</span>') +
          '</div><div class="mw-field-label">' + P.esc(f.label) + '</div>';
        if(cfg.editable){
          html += '<input type="text" data-value-for="' + f.id + '" value="' + P.esc(v.value) + '"' +
            ' aria-label="Value for ' + P.esc(f.path) + '"' +
            (f.type === "amount" && v.ccy ? ' data-ccy="' + P.esc(v.ccy) + '"' : "") + '>';
          if(f.type === "amount" && v.ccy)
            html += '<div class="mw-field-label">Currency: ' + P.esc(v.ccy) + '</div>';
        } else {
          html += '<span class="mw-val">' + P.esc(v.value) +
            (f.type === "amount" && v.ccy ? " (" + P.esc(v.ccy) + ")" : "") + '</span>';
        }
        html += '</div>';
      });
      list.innerHTML = html;
    }
    function renderTarget(){
      var msg = tgtMsg();
      var title = $("target-title");
      if(title) title.textContent = "Target: " + msg.name + " (" + msg.title + ")";
      var list = $("target-list");
      if(!list) return;
      var mappedBy = {};
      state.mappings.forEach(function(m){ mappedBy[m.targetId] = m; });
      var html = "";
      msg.fields.forEach(function(f){
        var m = mappedBy[f.id];
        var sel = state.selTarget === f.id ? " sel" : "";
        var cls = "mw-field" + sel + (m ? " mapped" : "");
        html += '<div class="' + cls + '" data-field-id="' + f.id + '" tabindex="0" role="button">' +
          '<div class="mw-field-top"><code>' + P.esc(f.path) + '</code>' +
          '<span class="pf-tag">' + f.type + '</span>' +
          (f.req ? '<span class="pf-tag amber">Required</span>' : '<span class="pf-tag grey">Optional</span>') +
          (m ? '<span class="pf-tag">Mapped</span>' : '') +
          '</div><div class="mw-field-label">' + P.esc(f.label) + '</div>';
        if(m){
          var sf = fieldById(srcMsg(), m.sourceId);
          html += '<div class="mw-mapped">Mapped from ' + P.esc(sf ? sf.path : m.sourceId) +
            ' (' + TRANSFORM_LABELS[m.transform] + ')</div>';
        }
        html += '</div>';
      });
      list.innerHTML = html;
    }
    function renderSelections(){
      var ss = $("sel-source");
      if(ss){
        if(state.selSource){
          var f = fieldById(srcMsg(), state.selSource);
          ss.textContent = "Selected source: " + (f ? f.path : state.selSource) +
            " (" + getValue(state.selSource).value + ")";
        } else {
          ss.textContent = "No source field selected yet. Click a field in the source panel.";
        }
      }
      var st = $("sel-target");
      if(st){
        if(state.selTarget){
          var tf = fieldById(tgtMsg(), state.selTarget);
          st.textContent = "Selected target: " + (tf ? tf.path : state.selTarget);
        } else {
          st.textContent = "No target field selected yet. Click a field in the target panel.";
        }
      }
    }
    function renderTransformUI(){
      var tr = $("transform");
      if(!tr) return;
      var kind = tr.value;
      var sw = $("second-wrap");
      var cw = $("constant-wrap");
      if(sw) sw.style.display = (kind === "concat") ? "" : "none";
      if(cw) cw.style.display = (kind === "constant") ? "" : "none";
      if(kind === "concat"){
        var sel = $("second-source");
        if(sel){
          var html = '<option value="">Choose a second source field</option>';
          srcMsg().fields.forEach(function(f){
            if(f.id === state.selSource) return;
            html += '<option value="' + f.id + '">' + P.esc(f.path) + ' (' + P.esc(f.value) + ')</option>';
          });
          sel.innerHTML = html;
        }
      }
    }
    function renderTable(){
      var body = $("map-table-body");
      var count = $("map-count");
      if(count) count.textContent = state.mappings.length + " mapping" +
        (state.mappings.length === 1 ? "" : "s");
      if(!body) return;
      if(!state.mappings.length){
        body.innerHTML = '<tr><td colspan="6">No mappings yet. Select a source field and a target field, then click Add mapping.</td></tr>';
        return;
      }
      var html = "";
      state.mappings.forEach(function(m, i){
        var sf = fieldById(srcMsg(), m.sourceId);
        var tf = fieldById(tgtMsg(), m.targetId);
        var r = resolveMapping(m);
        var err = tf ? validateValue(r.value, r.ccy, tf) : "unknown target field";
        var typeBad = false;
        if(tf && m.transform !== "constant"){
          if(m.transform === "concat") typeBad = tf.type !== "text";
          else if(sf) typeBad = sf.type !== tf.type && !(sf.type === "text" && tf.type === "code");
        }
        var status = (!err && !typeBad)
          ? '<span class="pf-check">Valid</span>'
          : '<span class="pf-cross">Invalid: ' + P.esc(err || "type mismatch") + '</span>';
        var valText = r.value + (r.ccy ? " (" + r.ccy + ")" : "");
        html += '<tr><td>' + P.esc(sf ? sf.path : m.sourceId) + '</td>' +
          '<td>' + TRANSFORM_LABELS[m.transform] +
          (m.transform === "concat" ? " + " + P.esc((fieldById(srcMsg(), m.secondSourceId) || {}).path || "") : "") +
          (m.transform === "constant" ? ": " + P.esc(m.constant || "") : "") + '</td>' +
          '<td>' + P.esc(tf ? tf.path : m.targetId) + '</td>' +
          '<td class="wrap">' + P.esc(valText) + '</td>' +
          '<td>' + status + '</td>' +
          '<td><button type="button" class="pf-btn danger" data-remove-index="' + i + '">Remove</button></td></tr>';
      });
      body.innerHTML = html;
    }
    function hideXml(){
      var w = $("xml-wrap");
      if(w) w.style.display = "none";
      var out = $("xml-out");
      if(out) out.textContent = "";
    }
    function renderAll(){
      renderSource();
      renderTarget();
      renderSelections();
      renderTransformUI();
      renderTable();
    }

    /* ----- actions ----- */
    function addMapping(){
      var fb = $("feedback");
      if(!state.selSource || !state.selTarget){
        P.showFeedback(cfg.prefix + "-feedback", "err",
          "Select a source field and a target field first. Click a field in the source panel, then click a field in the target panel.");
        return false;
      }
      var already = state.mappings.some(function(m){ return m.targetId === state.selTarget; });
      if(already){
        var tf = fieldById(tgtMsg(), state.selTarget);
        P.showFeedback(cfg.prefix + "-feedback", "err",
          "Target field " + (tf ? tf.path : state.selTarget) +
          " is already mapped. Remove the existing mapping before mapping it again.");
        return false;
      }
      var tr = $("transform");
      var kind = tr ? tr.value : "direct";
      var m = {sourceId: state.selSource, targetId: state.selTarget, transform: kind,
        secondSourceId: null, constant: null};
      if(kind === "concat"){
        var ss = $("second-source");
        if(!ss || !ss.value){
          P.showFeedback(cfg.prefix + "-feedback", "err",
            "Concatenation needs a second source field. Choose one from the dropdown.");
          return false;
        }
        m.secondSourceId = ss.value;
      }
      if(kind === "constant"){
        var ci = $("constant");
        if(!ci || ci.value.trim() === ""){
          P.showFeedback(cfg.prefix + "-feedback", "err",
            "A constant value mapping needs a value. Type the fixed value first.");
          return false;
        }
        m.constant = ci.value.trim();
      }
      state.mappings.push(m);
      var sf = fieldById(srcMsg(), m.sourceId);
      var t2 = fieldById(tgtMsg(), m.targetId);
      state.selSource = null;
      state.selTarget = null;
      hideXml();
      renderAll();
      P.showFeedback(cfg.prefix + "-feedback", "ok",
        "Mapping added: " + (sf ? sf.path : m.sourceId) + " (" + TRANSFORM_LABELS[kind] +
        ") to " + (t2 ? t2.path : m.targetId) + ".");
      if(cfg.onMappingsChange) cfg.onMappingsChange();
      return true;
    }
    function removeMapping(i){
      state.mappings.splice(i, 1);
      hideXml();
      renderAll();
      P.showFeedback(cfg.prefix + "-feedback", "ok", "Mapping removed.");
      if(cfg.onMappingsChange) cfg.onMappingsChange();
    }
    function runValidation(){
      var v = validateAll();
      var kind = v.problems.length ? "err" : (v.warnings.length ? "warn" : "ok");
      P.showFeedback(cfg.prefix + "-feedback", kind, validationHtml(v));
      return v;
    }
    function generate(){
      var v = validateAll();
      if(v.problems.length){
        hideXml();
        P.showFeedback(cfg.prefix + "-feedback", "err",
          "<b>Cannot generate XML yet.</b><ul>" +
          v.problems.map(function(p){ return "<li>" + P.esc(p) + "</li>"; }).join("") + "</ul>");
        return null;
      }
      var tgt = tgtMsg();
      var values = {};
      state.mappings.forEach(function(m){
        values[m.targetId] = resolveMapping(m);
      });
      var xml = buildXml(tgt, values);
      var out = $("xml-out");
      var wrap = $("xml-wrap");
      if(out) out.textContent = xml;
      if(wrap) wrap.style.display = "";
      P.showFeedback(cfg.prefix + "-feedback", "ok",
        "Generated " + tgt.name + " XML from " + state.mappings.length + " mapping" +
        (state.mappings.length === 1 ? "" : "s") +
        ". Only the mapped fields are included, in the correct target structure.");
      return xml;
    }
    function clearAll(silent){
      state.mappings = [];
      state.selSource = null;
      state.selTarget = null;
      hideXml();
      renderAll();
      if(!silent)
        P.showFeedback(cfg.prefix + "-feedback", "ok", "Mappings cleared.");
      if(cfg.onMappingsChange) cfg.onMappingsChange();
    }
    function setPair(newSource, newTarget, note){
      var changed = (newSource && newSource !== state.sourceId) ||
        (newTarget && newTarget !== state.targetId);
      if(newSource) state.sourceId = newSource;
      if(newTarget) state.targetId = newTarget;
      if(changed){
        clearAll(true);
        if(note)
          P.showFeedback(cfg.prefix + "-feedback", "ok", note);
      } else {
        renderAll();
      }
    }

    /* ----- wiring ----- */
    function wire(){
      var ss = $("source-select");
      if(ss){
        ss.innerHTML = MESSAGE_ORDER.map(function(id){
          return '<option value="' + id + '">' + MESSAGES[id].name + ' - ' + P.esc(MESSAGES[id].title) + '</option>';
        }).join("");
        ss.value = state.sourceId;
        ss.addEventListener("change", function(){
          setPair(ss.value, null, "Source changed to " + MESSAGES[ss.value].name + ". Mappings cleared.");
        });
      }
      var ts = $("target-select");
      if(ts){
        ts.innerHTML = MESSAGE_ORDER.map(function(id){
          return '<option value="' + id + '">' + MESSAGES[id].name + ' - ' + P.esc(MESSAGES[id].title) + '</option>';
        }).join("");
        ts.value = state.targetId;
        ts.addEventListener("change", function(){
          setPair(null, ts.value, "Target changed to " + MESSAGES[ts.value].name + ". Mappings cleared.");
        });
      }
      var sl = $("source-list");
      if(sl){
        sl.addEventListener("click", function(e){
          if(e.target && e.target.tagName === "INPUT") return;
          var row = e.target.closest ? e.target.closest(".mw-field") : null;
          if(!row) return;
          state.selSource = row.getAttribute("data-field-id");
          renderSource();
          renderSelections();
          renderTransformUI();
        });
        sl.addEventListener("keydown", function(e){
          if(e.target && e.target.tagName === "INPUT") return;
          if(e.key !== "Enter" && e.key !== " ") return;
          var row = e.target.closest ? e.target.closest(".mw-field") : null;
          if(!row) return;
          e.preventDefault();
          state.selSource = row.getAttribute("data-field-id");
          renderSource();
          renderSelections();
          renderTransformUI();
        });
        sl.addEventListener("change", function(e){
          var inp = e.target;
          if(!inp || !inp.getAttribute || !inp.getAttribute("data-value-for")) return;
          setValue(inp.getAttribute("data-value-for"), inp.value);
          var xml = $("source-xml");
          if(xml){
            var vals = {};
            srcMsg().fields.forEach(function(f){ vals[f.id] = getValue(f.id); });
            xml.textContent = buildXml(srcMsg(), vals);
          }
        });
      }
      var tl = $("target-list");
      if(tl){
        tl.addEventListener("click", function(e){
          var row = e.target.closest ? e.target.closest(".mw-field") : null;
          if(!row) return;
          state.selTarget = row.getAttribute("data-field-id");
          renderTarget();
          renderSelections();
        });
        tl.addEventListener("keydown", function(e){
          if(e.key !== "Enter" && e.key !== " ") return;
          var row = e.target.closest ? e.target.closest(".mw-field") : null;
          if(!row) return;
          e.preventDefault();
          state.selTarget = row.getAttribute("data-field-id");
          renderTarget();
          renderSelections();
        });
      }
      var tr = $("transform");
      if(tr) tr.addEventListener("change", renderTransformUI);
      var add = $("add-mapping");
      if(add) add.addEventListener("click", addMapping);
      var tb = $("map-table-body");
      if(tb){
        tb.addEventListener("click", function(e){
          var btn = e.target.closest ? e.target.closest("[data-remove-index]") : null;
          if(!btn) return;
          removeMapping(parseInt(btn.getAttribute("data-remove-index"), 10));
        });
      }
      var vb = $("validate");
      if(vb) vb.addEventListener("click", runValidation);
      var gb = $("generate");
      if(gb) gb.addEventListener("click", generate);
      var cb = $("clear");
      if(cb) cb.addEventListener("click", function(){ clearAll(false); });
      var cp = $("copy-xml");
      if(cp){
        cp.addEventListener("click", function(){
          var out = $("xml-out");
          var text = out ? out.textContent : "";
          if(!text){
            P.showFeedback(cfg.prefix + "-feedback", "warn", "Nothing to copy yet. Generate the XML first.");
            return;
          }
          function done(){
            P.showFeedback(cfg.prefix + "-feedback", "ok", "XML copied to clipboard.");
          }
          if(navigator.clipboard && navigator.clipboard.writeText){
            navigator.clipboard.writeText(text).then(done, function(){ fallbackCopy(text, done); });
          } else {
            fallbackCopy(text, done);
          }
        });
      }
      var dl = $("download-xml");
      if(dl){
        dl.addEventListener("click", function(){
          var out = $("xml-out");
          var text = out ? out.textContent : "";
          if(!text){
            P.showFeedback(cfg.prefix + "-feedback", "warn", "Nothing to download yet. Generate the XML first.");
            return;
          }
          P.downloadText(tgtMsg().name + "-generated.xml", text);
          P.showFeedback(cfg.prefix + "-feedback", "ok", "XML downloaded as " + tgtMsg().name + "-generated.xml.");
        });
      }
    }
    function fallbackCopy(text, done){
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); }
      catch(e){
        P.showFeedback(cfg.prefix + "-feedback", "warn", "Copy did not work in this browser. Select the XML text manually.");
      }
      ta.remove();
    }

    wire();
    renderAll();
    return {
      state: state,
      mappings: function(){ return state.mappings; },
      validate: validateAll,
      runValidation: runValidation,
      generate: generate,
      clearAll: clearAll,
      resolveMapping: resolveMapping,
      getValue: getValue
    };
  }

  /* ---------- free workbench ---------- */
  var wb = createMapper({prefix: "wb", changeable: true, editable: true});

  /* ---------- guided exercise: pain.001 to pacs.008 ---------- */
  var EXERCISE = [
    {source: "dbtr-nm", targets: ["dbtr-nm"], label: "Debtor name",
     why: "The debtor name moves unchanged from PmtInf.Dbtr.Nm in pain.001 to CdtTrfTxInf.Dbtr.Nm in pacs.008. The debtor is the same party in both messages."},
    {source: "dbtr-iban", targets: ["dbtr-iban"], label: "Debtor IBAN",
     why: "The debtor account IBAN moves unchanged. The pacs.008 debtor account identifies the account to debit."},
    {source: "dbtr-bic", targets: ["dbtr-bic"], label: "Debtor agent BIC",
     why: "The debtor agent BIC moves unchanged. It identifies the debtor bank in the FI to FI message."},
    {source: "end-to-end-id", targets: ["end-to-end-id"], label: "EndToEndId",
     why: "The EndToEndId is the link between the customer instruction and the interbank message. It must be carried unchanged so the payment can be tracked end to end."},
    {source: "instd-amt", targets: ["intr-bk-sttlm-amt", "instd-amt"], label: "Instructed amount with currency",
     why: "The instructed amount and its currency become the interbank settlement amount (IntrBkSttlmAmt) in pacs.008. Mapping it to the pacs.008 InstdAmt is also accepted here; IntrBkSttlmAmt is the amount the banks settle between themselves."},
    {source: "cdtr-nm", targets: ["cdtr-nm"], label: "Creditor name",
     why: "The creditor name moves unchanged from CdtTrfTxInf.Cdtr.Nm in pain.001 to the same element in pacs.008."},
    {source: "cdtr-iban", targets: ["cdtr-iban"], label: "Creditor IBAN",
     why: "The creditor account IBAN moves unchanged. It identifies the account to credit."},
    {source: "cdtr-bic", targets: ["cdtr-bic"], label: "Creditor agent BIC",
     why: "The creditor agent BIC moves unchanged. It identifies the creditor bank."},
    {source: "rmt-inf", targets: ["rmt-inf"], label: "Remittance information",
     why: "The unstructured remittance information moves unchanged so the creditor can reconcile the payment against the invoice."}
  ];
  var EXERCISE_GROUPS = EXERCISE.map(function(req){ return req.targets; });

  var exChecked = false;
  var exGenerated = false;

  var ex = createMapper({
    prefix: "ex",
    fixedSource: "pain001",
    fixedTarget: "pacs008",
    editable: false,
    requiredGroups: function(){ return EXERCISE_GROUPS; },
    onMappingsChange: function(){
      exChecked = false;
      exGenerated = false;
      var wrap = P.el("ex-comparison-wrap");
      if(wrap) wrap.style.display = "none";
      var st = P.el("ex-score-text");
      if(st) st.textContent = "Mappings changed. Check again to update your score.";
    }
  });

  function exerciseCorrectCount(){
    var maps = ex.mappings();
    var count = 0;
    EXERCISE.forEach(function(req){
      var m = null;
      for(var i = 0; i < maps.length; i++){
        if(req.targets.indexOf(maps[i].targetId) !== -1){ m = maps[i]; break; }
      }
      if(m && m.sourceId === req.source) count++;
    });
    return count;
  }
  function exerciseScore(){
    return exerciseCorrectCount() * 10 + (exGenerated ? 10 : 0);
  }
  function updateExerciseScore(){
    var score = exerciseScore();
    P.renderScoreBar("ex-score-bar", score, TOTAL);
    var st = P.el("ex-score-text");
    if(st){
      st.textContent = "Score " + score + " of " + TOTAL + " points. " +
        exerciseCorrectCount() + " of 9 mappings correct" +
        (exGenerated ? ", XML generated." : ", XML not generated yet.") +
        " Each correct mapping earns 10 points, successful XML generation earns 10 more.";
    }
    var best = P.el("ex-best");
    if(best){
      var saved = P.getScore(FEATURE_ID);
      best.textContent = saved
        ? "Best exercise score: " + saved.best + " / " + saved.bestTotal
        : "Best exercise score: not attempted yet";
    }
  }
  function checkExercise(){
    var maps = ex.mappings();
    var body = P.el("ex-comparison-body");
    var wrap = P.el("ex-comparison-wrap");
    var rows = "";
    var correct = 0;
    EXERCISE.forEach(function(req){
      var m = null;
      for(var i = 0; i < maps.length; i++){
        if(req.targets.indexOf(maps[i].targetId) !== -1){ m = maps[i]; break; }
      }
      var expectedSrc = fieldById(MESSAGES.pain001, req.source);
      var expectedTgt = req.targets.map(function(id){
        return (fieldById(MESSAGES.pacs008, id) || {}).path;
      }).join(" or ");
      var expected = (expectedSrc ? expectedSrc.path : req.source) + " to " + expectedTgt;
      var yours = "Not mapped";
      var ok = false;
      if(m){
        var s = fieldById(MESSAGES.pain001, m.sourceId);
        var t = fieldById(MESSAGES.pacs008, m.targetId);
        yours = (s ? s.path : m.sourceId) + " to " + (t ? t.path : m.targetId) +
          " (" + TRANSFORM_LABELS[m.transform] + ")";
        ok = m.sourceId === req.source;
      }
      if(ok) correct++;
      rows += "<tr" + (ok ? ' class="hl"' : ' class="bad"') + "><td>" + P.esc(req.label) + "</td>" +
        "<td>" + P.esc(expected) + "</td><td>" + P.esc(yours) + "</td>" +
        "<td>" + (ok ? '<span class="pf-check">Correct</span>' : '<span class="pf-cross">Not correct</span>') + "</td>" +
        '<td class="wrap">' + P.esc(req.why) + "</td></tr>";
    });
    if(body) body.innerHTML = rows;
    if(wrap) wrap.style.display = "";
    exChecked = true;
    updateExerciseScore();
    P.recordScore(FEATURE_ID, exerciseScore(), TOTAL, "pain.001 to pacs.008 exercise");
    P.showFeedback("ex-feedback",
      correct === 9 ? "ok" : "warn",
      correct === 9
        ? "<b>All 9 mappings are correct.</b> Now generate the pacs.008 XML to earn the final 10 points."
        : "<b>" + correct + " of 9 mappings correct.</b> Compare each row with the reference mapping above, fix the ones marked Not correct, and check again.");
    updateExerciseScore();
    return correct;
  }
  function generateExercise(){
    var xml = ex.generate();
    if(!xml){
      exGenerated = false;
      return null;
    }
    exGenerated = true;
    if(!exChecked) checkExercise();
    else {
      updateExerciseScore();
      P.recordScore(FEATURE_ID, exerciseScore(), TOTAL, "pain.001 to pacs.008 exercise");
    }
    if(exerciseCorrectCount() === 9){
      P.showFeedback("ex-feedback", "ok",
        "<b>Exercise complete: 100 of 100.</b> All 9 mappings are correct and the pacs.008 XML is generated. Your best score is saved in this browser.");
    }
    updateExerciseScore();
    return xml;
  }
  function resetExercise(){
    ex.clearAll(true);
    exChecked = false;
    exGenerated = false;
    var wrap = P.el("ex-comparison-wrap");
    if(wrap) wrap.style.display = "none";
    var body = P.el("ex-comparison-body");
    if(body) body.innerHTML = "";
    P.hideFeedback("ex-feedback");
    P.resetFeature(FEATURE_ID);
    P.renderScoreBar("ex-score-bar", 0, TOTAL);
    var st = P.el("ex-score-text");
    if(st) st.textContent = "Score 0 of 100 points. Each correct mapping earns 10 points, successful XML generation earns 10 more.";
    var best = P.el("ex-best");
    if(best) best.textContent = "Best exercise score: not attempted yet";
    P.showFeedback("ex-feedback", "ok", "Exercise reset. Map the nine fields again to try for 100.");
  }

  var checkBtn = P.el("ex-check");
  if(checkBtn) checkBtn.addEventListener("click", checkExercise);
  var genBtn = P.el("ex-generate");
  if(genBtn) genBtn.addEventListener("click", generateExercise);
  var resetBtn = P.el("ex-reset");
  if(resetBtn) resetBtn.addEventListener("click", resetExercise);

  /* Best score on load, and the exercise source XML. */
  updateExerciseScore();
  var exXml = P.el("ex-source-xml");
  if(exXml) exXml.textContent = buildXml(MESSAGES.pain001, sampleValues(MESSAGES.pain001));
  var overall = P.el("overall-best");
  if(overall){
    var saved = P.getScore(FEATURE_ID);
    overall.textContent = saved
      ? "Best exercise score: " + saved.best + " / " + saved.bestTotal
      : "Best exercise score: not attempted yet";
  }
  var resetAllBtn = P.el("resetAllBtn");
  if(resetAllBtn){
    resetAllBtn.addEventListener("click", function(){
      resetExercise();
      P.hideFeedback("ex-feedback");
      P.showFeedback("ex-feedback", "ok", "Mapping Workbench progress reset.");
    });
  }
})();
