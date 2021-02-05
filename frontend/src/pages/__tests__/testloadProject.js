import React from 'react';
import { shallow } from 'enzyme';
import LoadProject from '../loadProject';

// should add more tests later
it('displays the Loadprojectpage', () => {
    const testlist = shallow(
        <LoadProject />  
  );
  const sidebarComponents = testlist.find('div')
//   console.log(testlist.getElements()[0]['props']);
  expect(sidebarComponents.length).toEqual(3);
});