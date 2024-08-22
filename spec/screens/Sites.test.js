import React from "react";
import sites from "../../constants/sites";
import playgrounds from "../../constants/playgrounds";

describe('Agencies', () => {
  it('calculates playground counts', () => {

    const sitePlaygrounds = playgrounds.filter(pg=>pg.site_id===3);

    expect(sitePlaygrounds.length).toBe(2);
  });
});