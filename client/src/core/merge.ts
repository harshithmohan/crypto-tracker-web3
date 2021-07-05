import { extend, find, each } from 'lodash';

const mergeByProperty = (arr1: any[], arr2: any[], prop: string) => {
  each(arr2, (arr2obj) => {
    const arr1obj = find(arr1, (arr1item) => arr1item[prop] === arr2obj[prop]);

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    arr1obj ? extend(arr1obj, arr2obj) : arr1.push(arr2obj);
  });
};

export default mergeByProperty;
