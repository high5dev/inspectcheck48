export default function V00047_AddPreNotesToInspectionConditionsTable() {
  function version() {
    return 47
  }

  function title() {
    return "Add PreNotes To Inspection Conditions Table";
  }

  function step() {
    return "alter table inspection_conditions\n" +
      "\tadd preNotes text default '';"
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}