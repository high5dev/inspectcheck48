export default function V00005_AddNotesToSites(){
  function version(){
    return 5;
  }
  function title(){
    return "Add Notes To Sites";
  }
  function step(){
    return "ALTER TABLE sites ADD COLUMN notes TEXT NOT NULL DEFAULT '';"
  }
  return {
    version: version(),
    step: step(),
    title: title()
  }
}