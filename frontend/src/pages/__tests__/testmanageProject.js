import React from 'react';
import { shallow } from 'enzyme';
import ManageProject from '../manageProject';

// should add more tests later
it('displays the Manageprojectpage', () => {
    const testlist = shallow(
        <ManageProject />  
  );
  const sidebarComponents = testlist.find('div')
//   console.log(testlist.getElements()[0]['props']);
  expect(sidebarComponents.length).toEqual(3);
});