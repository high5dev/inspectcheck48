export default function V00002_RenameOwnersTableToAgencies(){
  function version(){
    return 2;
  }
  function title(){
    return "Rename Owners Table to Agencies";
  }
  function step(){
    return "ALTER TABLE owners RENAME TO agencies;"
  }
  return {
    version: version(),
    step: step(),
    title: title()
  }
}