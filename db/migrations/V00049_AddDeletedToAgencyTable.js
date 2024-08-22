export default function V00049_AddDeletedToAgencyTable() {
  function version() {
    return 49
  }

  function title() {
    return "Add Deleted To Agency Table";
  }

  function step() {
    return "alter table agencies\n" +
      "\tadd deleted boolean default false;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}