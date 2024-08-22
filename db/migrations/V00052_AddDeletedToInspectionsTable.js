export default function V00052_AddDeletedToInspectionsTable() {
  function version() {
    return 52
  }

  function title() {
    return "Add Deleted To Inspections Table";
  }

  function step() {
    return "alter table inspections\n" +
      "\tadd deleted boolean default false;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}