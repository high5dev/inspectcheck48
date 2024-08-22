export default function V00046_AddInspectionConditionsTable() {
  function version() {
    return 46
  }

  function title() {
    return "Add Inspection Conditions Table";
  }

  function step() {
    return "create table inspection_conditions\n" +
      "(\n" +
      "\tid text\n" +
      "\t\tconstraint inspection_conditions_pk\n" +
      "\t\t\tprimary key,\n" +
      "\tinspection_id text,\n" +
      "\tpre text,\n" +
      "\tpreAt integer default 0,\n" +
      "\tpost text,\n" +
      "\tpostAt integer default 0\n" +
      ");";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}