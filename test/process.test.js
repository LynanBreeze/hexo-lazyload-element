const { processAll } = require("../lib/process");

let context = null;
beforeEach(() => {
  context = {
    config: {
      lazyload: {},
    },
  };
});

it("lazyload", () => {
  const cases = [
    '<img src="https://abc.com/a.jpg" >',
    '<img src="https://abc.com/a.jpg" alt="11" />',
    '<iframe src="http://google.com"></iframe>',
    '<video src="http://test.mp4"></video>',
    '<video src="http://test.mp4"/>',
  ];

  const expectedValues = [
    '<span style="width: 100%;"><a class="gallery-item" href="https://abc.com/a.jpg" target="_blank" rel="noopener" ><span class="lazyload-wrap" data-content="%3Cimg%20src%3D%22https%3A%2F%2Fabc.com%2Fa.jpg%22%20%3E"><span class="placeholder"></span></span></a><noscript><img src="https://abc.com/a.jpg" ></noscript></span>',
    '<span style="width: 100%;"><a class="gallery-item" href="https://abc.com/a.jpg" target="_blank" rel="noopener" ><span class="lazyload-wrap" data-content="%3Cimg%20src%3D%22https%3A%2F%2Fabc.com%2Fa.jpg%22%20alt%3D%2211%22%20%2F%3E"><span class="placeholder"></span></span><span class="caption">11</span></a><noscript><img src="https://abc.com/a.jpg" alt="11" /></noscript></span>',
    '<span style="width: 100%;"><span class="lazyload-wrap" data-content="%3Ciframe%20src%3D%22http%3A%2F%2Fgoogle.com%22%3E%3C%2Fiframe%3E"><span class="placeholder"></span></span><noscript>This iframe content need to be loaded by JavaScript.</noscript></span>',
    '<span style="width: 100%;"><span class="lazyload-wrap" data-content="%3Cvideo%20src%3D%22http%3A%2F%2Ftest.mp4%22%3E%3C%2Fvideo%3E"><span class="placeholder"></span></span><noscript><video src="http://test.mp4"></video></noscript></span>',
    '<span style="width: 100%;"><span class="lazyload-wrap" data-content="%3Cvideo%20src%3D%22http%3A%2F%2Ftest.mp4%22%2F%3E"><span class="placeholder"></span></span><noscript><video src="http://test.mp4"/></noscript></span>',
  ];
  cases.forEach((item, index) => {
    expect(processAll.bind(context)(item)).toBe(expectedValues[index]);
  });
});

it("with attr", () => {
  const cases = [
    '<img src="https://abc.com/a.jpg" alt="11" />',
    '<img src="https://abc.com/a.jpg" alt="$aspect-ratio=3/2=aspect-ratio" >',
    '<img src="https://abc.com/a.jpg" alt="$placeholder=http://aaa.jpg=placeholder$aspect-ratio=3/2=aspect-ratio" >',
  ];

  const expectedValues = [
    '<span style="width: 100%;"><a class="gallery-item" href="https://abc.com/a.jpg" target="_blank" rel="noopener" ><span class="lazyload-wrap" data-content="%3Cimg%20src%3D%22https%3A%2F%2Fabc.com%2Fa.jpg%22%20alt%3D%2211%22%20%2F%3E"><span class="placeholder"></span></span><span class="caption">11</span></a><noscript><img src="https://abc.com/a.jpg" alt="11" /></noscript></span>',
    '<span style="width: 100%;"><a class="gallery-item" href="https://abc.com/a.jpg" target="_blank" rel="noopener" ><span class="lazyload-wrap" data-content="%3Cimg%20src%3D%22https%3A%2F%2Fabc.com%2Fa.jpg%22%20alt%3D%22%24aspect-ratio%3D3%2F2%3Daspect-ratio%22%20%3E"><span class="placeholder"></span></span></a><noscript><img src="https://abc.com/a.jpg" alt="" ></noscript></span>',
    '<span style="width: 100%;"><a class="gallery-item" href="https://abc.com/a.jpg" target="_blank" rel="noopener" ><span class="lazyload-wrap" data-content="%3Cimg%20src%3D%22https%3A%2F%2Fabc.com%2Fa.jpg%22%20alt%3D%22%24placeholder%3Dhttp%3A%2F%2Faaa.jpg%3Dplaceholder%24aspect-ratio%3D3%2F2%3Daspect-ratio%22%20%3E"><span class="placeholder"></span></span></a><noscript><img src="https://abc.com/a.jpg" alt="" ></noscript></span>',
  ];
  cases.forEach((item, index) => {
    expect(processAll.bind(context)(item)).toBe(expectedValues[index]);
  });
});

it("no-lazy", () => {
  const testCases = [
    `<img src="abc.png" no-lazy/>`,
    `<img no-lazy src="abc.png" />`,
    `<img src="abc.png" no-lazy></img>`,
  ];
  testCases.forEach((item) => {
    expect(processAll.bind(context)(item)).toBe(item.replace(/\$?no-lazy/, ""));
  });
});
