export default function V00039_DropOriginalFindingAssetMediaTable() {
  function version() {
    return 39
  }

  function title() {
    return "Drop Original Finding Asset Media Table";
  }

  function step() {
    return "drop table finding_asset_media;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}