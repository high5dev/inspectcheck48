export default function V00036_RenameTempTableToNewMxQuickListTable() {
  function version() {
    return 36
  }

  function title() {
    return "Rename Temp Table To New Mx Quick List Table";
  }

  function step() {
    return "alter table mx_quick_list_dg_tmp rename to mx_quick_list;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}