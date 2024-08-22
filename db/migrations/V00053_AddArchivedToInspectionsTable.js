export default function V00053_AddArchivedToInspectionsTable() {
  function version() {
    return 53
  }

  function title() {
    return "Add Archived To Inspections Table";
  }

  function step() {
    return "alter table inspections\n" +
      "\tadd archived boolean default false;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}