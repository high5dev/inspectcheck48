export default function V00035_DropOriginalMxQuickListTable() {
  function version() {
    return 35
  }

  function title() {
    return "Drop Original Mx Quick List Table";
  }

  function step() {
    return "drop table mx_quick_list;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}