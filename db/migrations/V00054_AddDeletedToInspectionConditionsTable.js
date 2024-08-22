export default function V00054_AddDeletedToInspectionConditionsTable() {
  function version() {
    return 54
  }

  function title() {
    return "Add Deleted To Inspection Conditions Table";
  }

  function step() {
    return "alter table inspection_conditions\n" +
      "\tadd deleted boolean default false;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}