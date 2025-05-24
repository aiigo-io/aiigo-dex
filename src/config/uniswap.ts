export const UNISWAP_V3_CONTRACTS = {
  v3CoreFactoryAddress: '0x2b638a84413459026aA568037a523f90FFdc9726',
  multicall2Address: '0x28DC29A06b4Bad6DDb807b8Cc4a97B9EfF222b20',
  proxyAdminAddress: '0x3889EFF2C8b3b61C0d916B9eeCB4F9E421309e50',
  tickLensAddress: '0xE1728CDD916Eaf0aabE985812bCBFde791bC99Bf',
  nftDescriptorLibraryAddressV1_3_0: '0x13B4D135da13317a689d957426F7C1fD83eD8dD6',
  nonfungibleTokenPositionDescriptorAddressV1_3_0: '0x33C66b5ef5B14CE04Fc5084f564Bd29e049F1775',
  descriptorProxyAddress: '0x990ADd12564d8b961F87866Ad5EFA23A4055a2A4',
  nonfungibleTokenPositionManagerAddress: '0x485a551582B98f1313Bb485ad4c661015222BD1B',
  v3MigratorAddress: '0x553Ca1AD71B65bc378ccd7271D90A5B739B72eb4',
  v3StakerAddress: '0x18a951d5FA67Edd33f86f4198CB5a578a55d3e03',
  quoterV2Address: '0x8910ebAba9D85F6083d72FE11c09952a6AB68861',
  swapRouter02: '0x15a7121488c1bf222a3BC52F2Cc692E3BfD86F57',
}

export enum FeeAmount {
  LOW = 500,
  MEDIUM = 3000,
  HIGH = 10000,
}

export const FEE_TIERS = [
  {
    label: 'Low',
    value: FeeAmount.LOW,
    tag: '0.05%',
    tickSpacing: 10,
  },
  {
    label: 'Medium',
    value: FeeAmount.MEDIUM,
    tag: '0.30%',
    tickSpacing: 60,
  },
  {
    label: 'High',
    value: FeeAmount.HIGH,
    tag: '1.00%',
    tickSpacing: 200,
  },
]

export const TICK_STRATEGY = [
  {
    label: 'Safe',
    value: 60,
  },
  {
    label: 'Common',
    value: 15,
  },
  {
    label: 'Expert',
    value: 5,
  }
]
