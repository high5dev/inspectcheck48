export default function V00056_AddDeletedToMxItemMediaTable() {
  function version() {
    return 56
  }

  function title() {
    return "Add Deleted To Mx Item Media Table";
  }

  function step() {
    return "alter table mx_item_media\n" +
      "\tadd deleted boolean default false;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}