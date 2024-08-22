export default function V00014_CreateSyncDataTable(){
  function version(){
    return 14;
  }
  function title(){
    return "Create Sync Data Table";
  }
  function step(){
    return "create table sync_data\n" +
      "(\n" +
      "\tid integer\n" +
      "\t\tconstraint sync_data_pk\n" +
      "\t\t\tprimary key autoincrement,\n" +
      "\ttype text,\n" +
      "\tdata text,\n" +
      "\t\"table\" text,\n" +
      "\tpkVal text,\n" +
      "\tprocessed integer default 0 not null\n" +
      ");"
  }
  return {
    version: version(),
    step: step(),
    title: title()
  }
}