export default function V00017_CreateConfigKeyIndex() {
  function version() {
    return 17
  }

  function title() {
    return "Create Config Key Index";
  }

  function step() {
    return "create unique index configs_key_uindex\n" +
      "\ton configs (key);"
  }

  return {
    version: version(),
    step: step(),
    title: title()
  }
}