export default function V00013_CreateAssetsTable(){
  function version(){
    return 13;
  }
  function title(){
    return "Create Assets Table";
  }
  function step(){
    return "create table assets\n" +
      "(\n" +
      "\tid TEXT default '' not null\n" +
      "\t\tconstraint assets_pk\n" +
      "\t\t\tprimary key,\n" +
      "\tplayground_id TEXT default '' not null,\n" +
      "\tname TEXT default '' not null,\n" +
      "\tthumbnail_url TEXT default '' not null,\n" +
      "\tpart_number TEXT default '' not null,\n" +
      "\tnotes TEXT default '' not null\n" +
      ");"
  }
  return {
    version: version(),
    step: step(),
    title: title()
  }
}