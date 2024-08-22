export default function V00028_DropOldFindingAssetTable() {
  function version() {
    return 28
  }

  function title() {
    return "Drop Old Finding Asset Table";
  }

  function step() {
    return "drop table finding_asset;";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}