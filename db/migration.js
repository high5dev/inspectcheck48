import V00001_CreateOwnersTable from "./migrations/V00001_CreateOwnersTable";
import V00002_RenameOwnersTableToAgencies from "./migrations/V00002_RenameOwnersTableToAgencies";
import V00003_CreateSitesTable from "./migrations/V00003_CreateSitesTable";
import V00004_AddNotesToAgencies from "./migrations/V00004_AddNotesToAgencies";
import V00005_AddNotesToSites from "./migrations/V00005_AddNotesToSites";
import V00006_AlterAgencies from "./migrations/V00006_AlterAgencies";
import V00007_ChangeSitesToPlaygrounds from "./migrations/V00007_ChangeSitesToPlaygrounds";
import V00008_AgenciesCopyData from "./migrations/V00008_AgenciesCopyData";
import V00009_DropOldAgencies from "./migrations/V00009_DropOldAgencies";
import V00010_RenameTempTableToAgencies from "./migrations/V00010_RenameTempTableToAgencies";
import V00011_MigrateDataToTempTable from "./migrations/V00011_MigrateDataToTempTable";
import V00012_DropSitesTable from "./migrations/V00012_DropSites";
import V00013_CreateAssetsTable from "./migrations/V00013_CreateAssetsTable";
import V00014_CreateSyncDataTable from "./migrations/V00014_CreateSyncDataTable";
import V00015_CreateConfigsTable from "./migrations/V00015_CreateConfigsTable";
import V00016_GenerateDeviceId from "./migrations/V00016_GenerateDeviceId";
import V00017_CreateConfigKeyIndex from "./migrations/V00017_CreateConfigKeyIndex";
import V00018_CreateAssetCategoryTable from "./migrations/V00018_CreateAssetCategoryTable";
import V00019_CreateAssetTypeTable from "./migrations/V00019_CreateAssetTypeTable";
import V00020_CreateInspectionTypesTable from "./migrations/V00020_CreateInspectionTypesTable";
import V00021_CreateInspectionsTable from "./migrations/V00021_CreateInspectionsTable";
import V00022_CreateMediaTable from "./migrations/V00022_CreateMediaTable";
import V00023_CreateFindingAssetTable from "./migrations/V00023_CreateFindingAssetTable";
import V00024_CreateFindingAssetMediaTable from "./migrations/V00024_CreateFindingAssetMediaTable";
import V00025_AlterAssetsTableAddType from "./migrations/V00025_AlterAssetsTableAddType";
import V00026_AddNewTempFindingAssetTable from "./migrations/V00026_AddNewTempFindingAssetTable";
import V00027_CopyFindingAssetData from "./migrations/V00027_CopyFindingAssetData";
import V00028_DropOldFindingAssetTable from "./migrations/V00028_DropOldFindingAssetTable";
import V00029_RenameTempFindingAssetTable from "./migrations/V00029_RenameTempFindingAssetTable";
import V00030_CreateMxQuickListTable from "./migrations/V00030_CreateMxQuickListTable";
import V00031_CreateInspectionMxItemsTable from "./migrations/V00031_CreateInspectionMxItemsTable";
import V00032_AddTitleColumnToInspectionMxItemsTable from "./migrations/V00032_AddTitleColumnToInspectionMxItemsTable";
import V00033_CreateMxQuickListTempTable from "./migrations/V00033_CreateMxQuickListTempTable";
import V00034_CopyUniqueMxQuickListDataToTempTable from "./migrations/V00034_CopyUniqueMxQuickListDataToTempTable";
import V00035_DropOriginalMxQuickListTable from "./migrations/V00035_DropOriginalMxQuickListTable";
import V00036_RenameTempTableToNewMxQuickListTable from "./migrations/V00036_RenameTempTableToNewMxQuickListTable";
import V00037_CreateFindingAssetMediaTempTable from "./migrations/V00037_CreateFindingAssetMediaTempTable";
import V00038_CopyUniqueDataToFindingAssetMediaTempTable
  from "./migrations/V00038_CopyUniqueDataToFindingAssetMediaTempTable";
import V00039_DropOriginalFindingAssetMediaTable from "./migrations/V00039_DropOriginalFindingAssetMediaTable";
import V00040_RenameTempTableToNewFindingAssetMediaTable
  from "./migrations/V00040_RenameTempTableToNewFindingAssetMediaTable";
import V00041_CreateMxItemMediaTable from "./migrations/V00041_CreateMxItemMediaTable";
import V00042_AddTakenAtToMediaTable from "./migrations/V00042_AddTakenAtToMediaTable";
import V00043_AddTakenAtToAssetsTable from "./migrations/V00043_AddTakenAtToAssetsTable";
import V00044_AddTakenAtToFindingAssetMediaTable from "./migrations/V00044_AddTakenAtToFindingAssetMediaTable";
import V00045_AddTakenAtToMxItemMediaTable from "./migrations/V00045_AddTakenAtToMxItemMediaTable";
import V00046_AddInspectionConditionsTable from "./migrations/V00046_AddInspectionConditionsTable";
import V00047_AddPreNotesToInspectionConditionsTable from "./migrations/V00047_AddPreNotesToInspectionConditionsTable";
import V00048_AddPostNotesToInspectionConditionsTable
  from "./migrations/V00048_AddPostNotesToInspectionConditionsTable";
import V00049_AddDeletedToAgencyTable from "./migrations/V00049_AddDeletedToAgencyTable";
import V00050_AddDeletedToPlaygroundsTable from "./migrations/V00050_AddDeletedToPlaygroundsTable";
import V00051_AddDeletedToAssetsTable from "./migrations/V00051_AddDeletedToAssetsTable";
import V00052_AddDeletedToInspectionsTable from "./migrations/V00052_AddDeletedToInspectionsTable";
import V00053_AddArchivedToInspectionsTable from "./migrations/V00053_AddArchivedToInspectionsTable";
import V00054_AddDeletedToInspectionConditionsTable from "./migrations/V00054_AddDeletedToInspectionConditionsTable";
import V00055_AddDeletedToFindingAssetMediaTable from "./migrations/V00055_AddDeletedToFindingAssetMediaTable";
import V00056_AddDeletedToMxItemMediaTable from "./migrations/V00056_AddDeletedToMxItemMediaTable";
import V00057_AddDeletedToInspectionMxItemsTable from "./migrations/V00057_AddDeletedToInspectionMxItemsTable";
import V00058_AddQuickListCategoriesTable from "./migrations/V00058_AddQuickListCategoriesTable";
import V00059_AddQuickListItemsTable from "./migrations/V00059_AddQuickListItemsTable";
import {captureException} from "@sentry/react-native";

export default function migration(exec, query, callback) {
  const migrations = [
    V00001_CreateOwnersTable(),
    V00002_RenameOwnersTableToAgencies(),
    V00003_CreateSitesTable(),
    V00004_AddNotesToAgencies(),
    V00005_AddNotesToSites(),
    V00006_AlterAgencies(),
    V00007_ChangeSitesToPlaygrounds(),
    V00008_AgenciesCopyData(),
    V00009_DropOldAgencies(),
    V00010_RenameTempTableToAgencies(),
    V00011_MigrateDataToTempTable(),
    V00012_DropSitesTable(),
    V00013_CreateAssetsTable(),
    V00014_CreateSyncDataTable(),
    V00015_CreateConfigsTable(),
    V00016_GenerateDeviceId(),
    V00017_CreateConfigKeyIndex(),
    V00018_CreateAssetCategoryTable(),
    V00019_CreateAssetTypeTable(),
    V00020_CreateInspectionTypesTable(),
    V00021_CreateInspectionsTable(),
    V00022_CreateMediaTable(),
    V00023_CreateFindingAssetTable(),
    V00024_CreateFindingAssetMediaTable(),
    V00025_AlterAssetsTableAddType(),
    V00026_AddNewTempFindingAssetTable(),
    V00027_CopyFindingAssetData(),
    V00028_DropOldFindingAssetTable(),
    V00029_RenameTempFindingAssetTable(),
    V00030_CreateMxQuickListTable(),
    V00031_CreateInspectionMxItemsTable(),
    V00032_AddTitleColumnToInspectionMxItemsTable(),
    V00033_CreateMxQuickListTempTable(),
    V00034_CopyUniqueMxQuickListDataToTempTable(),
    V00035_DropOriginalMxQuickListTable(),
    V00036_RenameTempTableToNewMxQuickListTable(),
    V00037_CreateFindingAssetMediaTempTable(),
    V00038_CopyUniqueDataToFindingAssetMediaTempTable(),
    V00039_DropOriginalFindingAssetMediaTable(),
    V00040_RenameTempTableToNewFindingAssetMediaTable(),
    V00041_CreateMxItemMediaTable(),
    V00042_AddTakenAtToMediaTable(),
    V00043_AddTakenAtToAssetsTable(),
    V00044_AddTakenAtToFindingAssetMediaTable(),
    V00045_AddTakenAtToMxItemMediaTable(),
    V00046_AddInspectionConditionsTable(),
    V00047_AddPreNotesToInspectionConditionsTable(),
    V00048_AddPostNotesToInspectionConditionsTable(),
    V00049_AddDeletedToAgencyTable(),
    V00050_AddDeletedToPlaygroundsTable(),
    V00051_AddDeletedToAssetsTable(),
    V00052_AddDeletedToInspectionsTable(),
    V00053_AddArchivedToInspectionsTable(),
    V00054_AddDeletedToInspectionConditionsTable(),
    V00055_AddDeletedToFindingAssetMediaTable(),
    V00056_AddDeletedToMxItemMediaTable(),
    V00057_AddDeletedToInspectionMxItemsTable(),
    V00058_AddQuickListCategoriesTable(),
    V00059_AddQuickListItemsTable(),
  ];
  let migrationsTodo = [];

  function migrate(innerCallback) {
    if (migrationsTodo.length === 0) {
      innerCallback(null);
      return;
    }
    let nextMigration = migrationsTodo.shift();
    console.log("Performing Migration->" + nextMigration.title);
    exec(nextMigration.step, [], (error, result) => {
      if (error) {
        captureException(error);
        console.log(error);
        innerCallback({status: "Error", msg: error, version: nextMigration.version, title: nextMigration.title});
      } else {
        exec("INSERT INTO migrations_schema_history (version, description, success, installed_on) VALUES (?,?,1, datetime('now'));", [nextMigration.version, nextMigration.title], () => {
          setTimeout(() => migrate(innerCallback), 0);
        });
      }
    });
  }

  query("SELECT IFNULL(max(version),0) as version FROM migrations_schema_history LIMIT 1;", [], (error, result) => {
    if (error) {
      console.error("Error reading version", error);
      captureException(error);
    }
    let curVersion = 0;
    if (result.length > 0) {
      console.log("Cur DB Ver: " + result[0].version);
      curVersion = Number(result[0].version);
    }
    migrationsTodo = migrations.filter(m => m.version > curVersion);
    console.log("Have " + migrationsTodo.length + " migration(s) to run...");
    migrate((error) => {
      if (error) {
        console.error(error);
      }
      callback(error);
    })
  });
}