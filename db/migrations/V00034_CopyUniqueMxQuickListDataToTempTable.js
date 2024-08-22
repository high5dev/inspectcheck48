export default function V00034_CopyUniqueMxQuickListDataToTempTable() {
  function version() {
    return 34
  }

  function title() {
    return "Copy Unique Mx Quick List Data To Temp Table";
  }

  function step() {
    return "insert into mx_quick_list_dg_tmp(id, display, template) select id, display, template from mx_quick_list GROUP BY id;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}