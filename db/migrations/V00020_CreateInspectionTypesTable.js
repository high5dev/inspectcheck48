export default function V00020_CreateInspectionTypesTable() {
  function version() {
    return 20
  }

  function title() {
    return "Create Inspection Types Table";
  }

  function step() {
    return "create table inspection_types\n" +
      "(\n" +
      "\tid int\n" +
      "\t\tconstraint inspection_types_pk\n" +
      "\t\t\tprimary key,\n" +
      "\ttype text default '',\n" +
      "\tdescription text default '',\n" +
      "\tinclude_assets integer default 0,\n" +
      "\tvisible integer default 0\n" +
      ");";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}