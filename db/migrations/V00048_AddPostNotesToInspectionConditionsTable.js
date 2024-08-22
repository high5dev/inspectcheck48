export default function V00048_AddPostNotesToInspectionConditionsTable() {
  function version() {
    return 48
  }

  function title() {
    return "Add Post Notes To Inspection Conditions Table";
  }

  function step() {
    return "alter table inspection_conditions\n" +
      "\tadd postNotes text default '';";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}