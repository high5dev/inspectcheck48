export default function V00004_AddNotesToAgencies(){
  function version(){
    return 4;
  }
  function title(){
    return "Add Notes To Agencies";
  }
  function step(){
    return "ALTER TABLE agencies ADD COLUMN notes TEXT NOT NULL DEFAULT '';"
  }
  return {
    version: version(),
    step: step(),
    title: title()
  }
}