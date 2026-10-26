import { G } from '../render/geo';
/** Stylized procedural landmarks. Geometry stays inside catalogue bounds. */
export const LANDMARK_BUILDERS = {
  'atlas-tower': () => {
    const g=new G().cylB(1.3,3,30,0,0,0,0xd7dce6,8).cylB(5.6,4,5,0,27,0,0x68baca,12).cylB(.3,.8,16,0,32,0,0xf2e3bf,6);
    for(const a of [0,2.094,4.189]) g.box(.7,28,.7,Math.cos(a)*3,14,Math.sin(a)*3,0xe7e4da,{rx:Math.sin(a)*.15,rz:-Math.cos(a)*.15});
    return g.build();
  },
  'atlas-registan': () => {
    const g=new G().boxB(24,8,14,0,0,0,0xd7b57d).boxB(10,15,3,0,0,7,0x45bfc6).boxB(5,10,.2,0,0,8.55,0x173d54);
    for(const x of [-10,10]) for(const z of [-6,6]) g.cylB(.8,1,15,x,0,z,0xdbbd8c,8).dome(1.6,x,15,z,0x40bfc4,10,5);
    g.dome(5,0,8,-2,0x26b6c4,14,6);return g.build();
  },
  'atlas-pagoda': () => {
    const g=new G();for(let i=0;i<5;i++){const w=13-i*1.6;g.boxB(w-2,3.3,w-2,0,i*4,0,0xd45f61).cone(w*.7,2,0,i*4+3.3,0,0x30344a,4,{ry:Math.PI/4});}return g.cylB(.15,.2,4,0,20,0,0xe8c975,6).build();
  },
  'atlas-burj': () => {
    const g=new G();for(let i=0;i<6;i++)g.boxB(12-i*1.7,8,12-i*1.7,0,i*8,0,i%2?0x83b1c7:0xa7c9d7);return g.cylB(.1,.6,12,0,48,0,0xdfecf1,6).build();
  },
  'atlas-eiffel': () => {
    const g=new G();for(const x of [-1,1])for(const z of [-1,1])g.box(1.6,25,1.6,x*5,12,z*5,0x937965,{rx:z*.25,rz:-x*.25});
    g.boxB(16,1,16,0,12,0,0xb39a7b).boxB(10,1,10,0,24,0,0xb39a7b).cylB(.4,3,17,0,25,0,0x937965,4);
    for(let y=3;y<24;y+=4)g.box(13-y*.3,.4,13-y*.3,0,y,0,0x937965);return g.build();
  },
  'atlas-clock': () => new G().boxB(8,23,8,0,0,0,0xc3a47a).boxB(9,5,9,0,22,0,0xe6d5aa).box(4,4,.1,0,24.5,4.55,0xf4f1d9).box(.2,1.6,.15,0,25,4.65,0x334253).box(1.4,.2,.15,.6,24.5,4.65,0x334253).cone(5,3,0,28.5,0,0x547d77,4,{ry:Math.PI/4}).build(),
  'atlas-empire': () => {const g=new G();for(let i=0;i<4;i++){const w=16-i*3;g.boxB(w,10,14-i*3,0,i*10,0,0xa5b2c6);for(let y=2;y<10;y+=2)g.box(w+.05,.6,14-i*3+.05,0,i*10+y,0,0x546d91);}return g.cylB(.15,.8,8,0,40,0,0xe3eaf0,6).build();},
  'atlas-christ': () => new G().boxB(8,5,8,0,0,0,0x899187).cone(4,15,0,12.5,0,0xe8e6dc,6).box(18,2.2,2.5,0,18,0,0xe8e6dc).sphere(2,0,22,0,0xe8e6dc,8,6).build(),
  'atlas-pyramid': () => new G().cone(18.38,20,0,10,0,0xd8ae69,4,{ry:Math.PI/4}).build(),
  'atlas-lighthouse': () => {const g=new G().cylB(3,5,2,0,0,0,0x9eada6,12);for(let i=0;i<4;i++)g.cylB(2.5,2.8,5,0,2+i*5,0,i%2?0xe25952:0xf0eee0,12);return g.cylB(3,3,3,0,22,0,0xffd97e,10).cone(3.5,1,0,25.5,0,0x495962,10).build();},
  'atlas-opera': () => {const g=new G().boxB(24,2,18,0,0,0,0xd4c7af);for(let i=0;i<3;i++)g.cone(5,12-i*2,-6+i*6,8-i,0,0xf4f2e9,3,{rz:-.22});return g.build();},
  'atlas-station': () => new G().boxB(22,5,12,0,2,0,0xe25952).boxB(22.1,1,12.1,0,6,0,0xf3f5e8).boxB(16,2,.1,0,4,6.1,0x8bd3e8).cylB(.15,.15,10,7,0,0,0x455d71,6).box(3,1.8,.1,8.5,9,0,0x85e2d3).build(),
};
