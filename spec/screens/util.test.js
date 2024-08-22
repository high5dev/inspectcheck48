import {dbDateOnly, objArraySortByKey, stringNumberCompare, zeroPaddingReplacer, zLen} from "../../util/shared";

describe('util', function () {

  describe('date format', () => {

    it('should have date', () => {
      const dated = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));
      console.log(dated.getFullYear() + "-" + zLen(dated.getMonth().toString(), 2) + "-" + zLen(dated.getDate().toString(), 2) + " " + zLen(dated.getHours().toString(), 2) + ":" + zLen(dated.getMinutes().toString(), 2) + ":" + zLen(dated.getSeconds().toString(), 2));
    });

    it('should be able to calculate interval', () => {
      const timeIn = new Date("2020-02-02 22:59:17");
      const dateOnlyIn = dbDateOnly(timeIn);
      const timeOut = new Date("2020-02-02 23:30:11");
      const dateOnlyOut = dbDateOnly(timeOut);
      const daysSpread = Math.round((dateOnlyOut - dateOnlyIn) / 86400000);
      // const dated = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));
      // console.log(((timeOut - timeIn) / 1000) /3600 % 24);
      // console.log();
      const arrReportDays = [];
      if (daysSpread === 0) {
        //same day
        arrReportDays.push({
          dated: "H-m-d",
          timein: "H:i:s",
          timeout: "H:i:s"
        })
      } else {
        //more days

      }
      console.log(arrReportDays);
    });
  });
  describe('stringNumberCompare', function () {
    it('should compare', function () {
      expect(stringNumberCompare("a", "b")).toEqual(-1)
      expect(stringNumberCompare("a", "A")).toEqual(0);
      expect(stringNumberCompare("b", "A")).toEqual(1);

      expect(stringNumberCompare("a1", "a2")).toEqual(-1);
      expect(stringNumberCompare("a 1", "a 2")).toEqual(-1);
      expect(stringNumberCompare("a 2", "a 10")).toEqual(-1);
      expect(stringNumberCompare("a 2", "a 10")).toEqual(-1);
      expect(stringNumberCompare("a 2000", "a 100000000000")).toEqual(-1);

      expect(stringNumberCompare("a 1 2", "a 1 10")).toEqual(-1);

      expect(stringNumberCompare("a 1-2", "a 1-10")).toEqual(-1);
      expect(stringNumberCompare("a 1-1 1-2", "a 1-1 1-10")).toEqual(-1);
    });
  });
  describe('zeroPaddingReplacer', function () {
    it('should pad front with zeros', function () {
      expect(zeroPaddingReplacer(" 2")).toEqual(" 000000000002");
      expect(zeroPaddingReplacer("-2")).toEqual("-000000000002");
    });
  });
  describe('sortObject', function () {
    it('should not sort on missing key', function () {
      const objArray = [
        {id: "5", display: "b"},
        {id: "1", display: "a"},
        {id: "2", display: "a 1"},
        {id: "4", display: "a 10"},
        {id: "3", display: "a 2"},
      ];
      expect(objArraySortByKey(objArray)).toEqual(objArray);
    });

    it('should not sort on invalid key', function () {
      const objArray = [
        {id: "5", display: "b"},
        {id: "1", display: "a"},
        {id: "2", display: "a 1"},
        {id: "4", display: "a 10"},
        {id: "3", display: "a 2"},
      ];
      expect(objArraySortByKey(objArray, "test")).toEqual(objArray);
    });

    it('should sort', function () {

      const objArray = [
        {id: "5", display: "b"},
        {id: "1", display: "a"},
        {id: "2", display: "a 1"},
        {id: "4", display: "a 10"},
        {id: "3", display: "a 2"},
      ];
      expect(objArraySortByKey(objArray, "display")).toEqual([
        {id: "1", display: "a"},
        {id: "2", display: "a 1"},
        {id: "3", display: "a 2"},
        {id: "4", display: "a 10"},
        {id: "5", display: "b"},
      ])
    });

    it('should handle empty array', function () {
      const objArray = [];
      expect(objArraySortByKey(objArray, "display")).toEqual([])
    });
  });
});
