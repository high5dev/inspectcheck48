export default function V00019_CreateAssetTypeTable() {
  function version() {
    return 19
  }

  function title() {
    return "Create Asset Type Table";
  }

  function step() {
    return "create table asset_types\n" +
      "(\n" +
      "    id           text\n" +
      "        constraint asset_types_pk\n" +
      "            primary key,\n" +
      "    name         text default '' not null,\n" +
      "    category_id  text default '' not null,\n" +
      "    req_category int  default 0 not null,\n" +
      "    \"order\"      int  default 0 not null\n" +
      ");";
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}