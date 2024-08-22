export default function V00021_CreateInspectionsTable() {
  function version() {
    return 21
  }

  function title() {
    return "Create Inspections Table";
  }

  function step() {
    return "create table inspections\n" +
      "(\n" +
      "\tid text default ''\n" +
      "\t\tconstraint inspections_pk\n" +
      "\t\t\tprimary key,\n" +
      "\tdated datetime,\n" +
      "\tcompleted datetime,\n" +
      "\tinspected_by text default '',\n" +
      "\tuser_id integer default 0,\n" +
      "\ttype integer default 0,\n" +
      "\tplayground_id text default '',\n" +
      "\tequipment_type text default '',\n" +
      "\tsurfacing text default '',\n" +
      "\tintended_users_ages text default ''\n" +
      ");\n";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}