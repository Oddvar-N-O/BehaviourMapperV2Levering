import React from 'react';
import { shallow } from 'enzyme';
import SidebarLP from '../sidebarLP';

function smallfunc() {
    console.log("getProj");
}

it('shows a list of projects', () => {
    const initialProps = {
        projects: [[1, "prosjektnamn", "beskrivelse", "kartet", "screenshot", "1998-01-30 12:23:43", "1998-01-30 12:23:43", "zoom", 1],[2,"test","besk2"]],
        getCurrProj: smallfunc,
    }
    const testlist = shallow(
        <SidebarLP  {...initialProps}/>  
  );
  const sidebarComponents = testlist.find('li')
  expect(sidebarComponents.length).toEqual(initialProps.projects.length);
  sidebarComponents.forEach((sidebarComponent, index) => {
      expect(sidebarComponent.prop('children')).toEqual(initialProps.projects[index][1]);
  });
});