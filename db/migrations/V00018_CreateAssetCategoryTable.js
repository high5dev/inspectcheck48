export default function V00018_CreateAssetCategoryTable() {
  function version() {
    return 18
  }

  function title() {
    return "Create Asset Category Table";
  }

  function step() {
    return "create table asset_categories\n" +
      "(\n" +
      "    id      text\n" +
      "        constraint asset_categories_pk\n" +
      "            primary key,\n" +
      "    display text default '' not null\n" +
      ");"
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}