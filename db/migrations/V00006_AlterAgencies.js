export default function V00006_AlterAgencies(){
  function version(){
    return 6;
  }
  function title(){
    return "Update Agencies Table";
  }
  function step(){
    return "create table agencies_dg_tmp\n" +
      "(\n" +
      "\tid TEXT\n" +
      "\t\tprimary key,\n" +
      "\tname TEXT default '' not null,\n" +
      "\tpoc TEXT default '' not null,\n" +
      "\taddress1 TEXT default '' not null,\n" +
      "\taddress2 TEXT default '' not null,\n" +
      "\tcity TEXT default '' not null,\n" +
      "\tstate TEXT default '' not null,\n" +
      "\tzip TEXT default '' not null,\n" +
      "\tphone TEXT default '' not null,\n" +
      "\temail TEXT default '' not null,\n" +
      "\tnotes TEXT default '' not null\n" +
      ");\n" +
      "\n" +
      "insert into agencies_dg_tmp(id, name, poc, address1, address2, city, state, zip, phone, email, notes) select id, name, poc, address1, address2, city, state, zip, phone, email, notes from agencies;\n" +
      "\n" +
      "drop table agencies;\n" +
      "\n" +
      "alter table agencies_dg_tmp rename to agencies;"
  }
  return {
    version: version(),
    step: step(),
    title: title()
  }
}