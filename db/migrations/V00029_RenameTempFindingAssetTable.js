export default function V00029_RenameTempFindingAssetTable() {
  function version() {
    return 29
  }

  function title() {
    return "Rename Temp Finding Asset Table";
  }

  function step() {
    return "alter table finding_asset_dg_tmp rename to finding_asset;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}