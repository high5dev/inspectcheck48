export default function V00040_RenameTempTableToNewFindingAssetMediaTable() {
  function version() {
    return 40
  }

  function title() {
    return "Rename Temp Table To New Finding Asset Media Table";
  }

  function step() {
    return "alter table finding_asset_media_dg_tmp rename to finding_asset_media;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}