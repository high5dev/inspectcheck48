import React from "react";
import sites from "../../constants/sites";
import playgrounds from "../../constants/playgrounds";

describe('Agencies', () => {
  it('calculates playground counts', () => {

    const ownerPlaygrounds = sites.filter(site=>site.owner_id===1).reduce((pgs, site)=>{
      return pgs.concat(playgrounds.filter(pg=>pg.site_id===site.id));
    },[]);

    expect(ownerPlaygrounds.length).toBe(3);
  });
});