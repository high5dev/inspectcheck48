export default function V00015_CreateConfigsTable() {
  function version() {
    return 15;
  }

  function title() {
    return "Create Configs Table";
  }

  function step() {
    return "create table configs\n" +
      "(\n" +
      "\tkey text not null\n" +
      "\t\tconstraint configs_pk\n" +
      "\t\t\tprimary key,\n" +
      "\tvalue text\n" +
      ");"
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}