import {render} from 'react-native-testing-library';
import Home from "../../screens/Home.js";
import React from "react";

describe('Home Page', () => {
  it('renders buttons on Home', () => {
    const container = render(<Home/>);
    container.getByText("Inspections");
  });
});