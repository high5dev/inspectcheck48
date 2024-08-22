export default function V00045_AddTakenAtToMxItemMediaTable() {
  function version() {
    return 45
  }

  function title() {
    return "Add Taken At To Mx Item Media Table";
  }

  function step() {
    return "alter table mx_item_media\n" +
      "\tadd takenAt integer default 0;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}