export default function V00050_AddDeletedToPlaygroundsTable() {
  function version() {
    return 50
  }

  function title() {
    return "Add Deleted To Playgrounds Table";
  }

  function step() {
    return "alter table playgrounds\n" +
      "\tadd deleted boolean default false;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}