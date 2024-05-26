# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.6.0](https://github.com/MapColonies/export-management/compare/v1.6.4...v1.6.0) (2024-05-26)


### Features

* add get tasks and task by id api ([c4f65b6](https://github.com/MapColonies/export-management/commit/c4f65b61c96e04b7bbe5c5f18df3d33ce010c298))
* added base sql schema builder ([0f1dc26](https://github.com/MapColonies/export-management/commit/0f1dc2609a162e390cd3fb37152ce4719fcc3325))
* added connection manager and base repository ([40e3e1f](https://github.com/MapColonies/export-management/commit/40e3e1f90a61a60f3fc0d4c25f352b4f0bfa0f5e))
* added full schema sql file ([d0afee5](https://github.com/MapColonies/export-management/commit/d0afee540b3111f3c4ebd91ddbac669ea8ea5354))
* added typeorm entities ([d6539d7](https://github.com/MapColonies/export-management/commit/d6539d7cf2cb155b0f5d0dfa6d35a3b7fc1d7a40))
* Infra nginx opala + jwt payload sub support (MAPCO-3998) (MAPCO-4010) ([#16](https://github.com/MapColonies/export-management/issues/16)) ([4454b49](https://github.com/MapColonies/export-management/commit/4454b4914d0d2134b9728cdcf14bd8e9868481a3)), closes [#21](https://github.com/MapColonies/export-management/issues/21)


### Bug Fixes

* adapt db fields to openapi definitions ([06d6f0d](https://github.com/MapColonies/export-management/commit/06d6f0d37f05f9dba392b2725ab27cccddeb4fd7))
* added max task number config ([133ab57](https://github.com/MapColonies/export-management/commit/133ab570b0b8603341522930f4161c06baac3618))
* added more infomation about created task ([5833755](https://github.com/MapColonies/export-management/commit/58337556edef69f149fb9fd454668e9f3ade34cf))
* added postgis installation step if not exists ([f5a54b8](https://github.com/MapColonies/export-management/commit/f5a54b8fa6957d941f9b09b847db04ae74d9f23c))
* added postgis installation step if not exists ([7005ad2](https://github.com/MapColonies/export-management/commit/7005ad2637b164fca92f5a0ed74bc228673744c2))
* artifact type import source ([2449860](https://github.com/MapColonies/export-management/commit/24498601db23a5a23fb621f1833a94b0afdf324c))
* disabled sync by default ([cf95c45](https://github.com/MapColonies/export-management/commit/cf95c45fcb0a5633bdc4d1f97098dbf7c7c56ea5))
* fixed db connection and tests ([d1b9a63](https://github.com/MapColonies/export-management/commit/d1b9a63f6a95d1f1e9c31e777c6b5ddd326e40c5))
* lint errors ([d5d6cac](https://github.com/MapColonies/export-management/commit/d5d6cacce492685d845ce32c56c832bf767007be))
* openapi schemas + openapi integration test + helm ([4355e6e](https://github.com/MapColonies/export-management/commit/4355e6ef99f83ee2e88d51e8e8c3a6fd3abd0515))
* openapi schemas typeorm types + tests ([25da376](https://github.com/MapColonies/export-management/commit/25da376ef4a334589a53f9674da540b3fd8b6187))
* pr issues ([0f99990](https://github.com/MapColonies/export-management/commit/0f99990104e3a0fda169788589c2ff0401e4994d))
* pr issues ([38fba73](https://github.com/MapColonies/export-management/commit/38fba73843c793f955ff1c86b73068f2166b5fc0))
* pr issues ([b1832ee](https://github.com/MapColonies/export-management/commit/b1832ee62ba89ce7d468d2e8007b28b9e3c404bd))
* pr issues ([70c4510](https://github.com/MapColonies/export-management/commit/70c4510144ae7116ab8b76c7f3f0eb2de6e4a64d))
* pr issues ([2d831a6](https://github.com/MapColonies/export-management/commit/2d831a65ec21eeef3e54a125ac175b3e1433db55))
* removed default collate ([076c94c](https://github.com/MapColonies/export-management/commit/076c94cc662847094b38e163749d3ca9eb8f0c51))
* removed logs ([3745711](https://github.com/MapColonies/export-management/commit/37457118c96e52fda9f8f583738c3f7355a2d4a3))
* test ([9ef7310](https://github.com/MapColonies/export-management/commit/9ef7310519af7fea6261b1db14093c3ebe8b4355))

## [1.5.0](https://github.com/MapColonies/export-management/compare/v1.6.4...v1.5.0) (2024-05-26)


### Features

* add get tasks and task by id api ([c4f65b6](https://github.com/MapColonies/export-management/commit/c4f65b61c96e04b7bbe5c5f18df3d33ce010c298))
* added base sql schema builder ([0f1dc26](https://github.com/MapColonies/export-management/commit/0f1dc2609a162e390cd3fb37152ce4719fcc3325))
* added connection manager and base repository ([40e3e1f](https://github.com/MapColonies/export-management/commit/40e3e1f90a61a60f3fc0d4c25f352b4f0bfa0f5e))
* added full schema sql file ([d0afee5](https://github.com/MapColonies/export-management/commit/d0afee540b3111f3c4ebd91ddbac669ea8ea5354))
* added typeorm entities ([d6539d7](https://github.com/MapColonies/export-management/commit/d6539d7cf2cb155b0f5d0dfa6d35a3b7fc1d7a40))
* Infra nginx opala + jwt payload sub support (MAPCO-3998) (MAPCO-4010) ([#16](https://github.com/MapColonies/export-management/issues/16)) ([4454b49](https://github.com/MapColonies/export-management/commit/4454b4914d0d2134b9728cdcf14bd8e9868481a3)), closes [#21](https://github.com/MapColonies/export-management/issues/21)


### Bug Fixes

* adapt db fields to openapi definitions ([06d6f0d](https://github.com/MapColonies/export-management/commit/06d6f0d37f05f9dba392b2725ab27cccddeb4fd7))
* added max task number config ([133ab57](https://github.com/MapColonies/export-management/commit/133ab570b0b8603341522930f4161c06baac3618))
* added more infomation about created task ([5833755](https://github.com/MapColonies/export-management/commit/58337556edef69f149fb9fd454668e9f3ade34cf))
* added postgis installation step if not exists ([f5a54b8](https://github.com/MapColonies/export-management/commit/f5a54b8fa6957d941f9b09b847db04ae74d9f23c))
* added postgis installation step if not exists ([7005ad2](https://github.com/MapColonies/export-management/commit/7005ad2637b164fca92f5a0ed74bc228673744c2))
* artifact type import source ([2449860](https://github.com/MapColonies/export-management/commit/24498601db23a5a23fb621f1833a94b0afdf324c))
* disabled sync by default ([cf95c45](https://github.com/MapColonies/export-management/commit/cf95c45fcb0a5633bdc4d1f97098dbf7c7c56ea5))
* fixed db connection and tests ([d1b9a63](https://github.com/MapColonies/export-management/commit/d1b9a63f6a95d1f1e9c31e777c6b5ddd326e40c5))
* lint errors ([d5d6cac](https://github.com/MapColonies/export-management/commit/d5d6cacce492685d845ce32c56c832bf767007be))
* openapi schemas + openapi integration test + helm ([4355e6e](https://github.com/MapColonies/export-management/commit/4355e6ef99f83ee2e88d51e8e8c3a6fd3abd0515))
* openapi schemas typeorm types + tests ([25da376](https://github.com/MapColonies/export-management/commit/25da376ef4a334589a53f9674da540b3fd8b6187))
* pr issues ([0f99990](https://github.com/MapColonies/export-management/commit/0f99990104e3a0fda169788589c2ff0401e4994d))
* pr issues ([38fba73](https://github.com/MapColonies/export-management/commit/38fba73843c793f955ff1c86b73068f2166b5fc0))
* pr issues ([b1832ee](https://github.com/MapColonies/export-management/commit/b1832ee62ba89ce7d468d2e8007b28b9e3c404bd))
* pr issues ([70c4510](https://github.com/MapColonies/export-management/commit/70c4510144ae7116ab8b76c7f3f0eb2de6e4a64d))
* pr issues ([2d831a6](https://github.com/MapColonies/export-management/commit/2d831a65ec21eeef3e54a125ac175b3e1433db55))
* removed default collate ([076c94c](https://github.com/MapColonies/export-management/commit/076c94cc662847094b38e163749d3ca9eb8f0c51))
* removed logs ([3745711](https://github.com/MapColonies/export-management/commit/37457118c96e52fda9f8f583738c3f7355a2d4a3))
* test ([9ef7310](https://github.com/MapColonies/export-management/commit/9ef7310519af7fea6261b1db14093c3ebe8b4355))

## [1.4.0](https://github.com/MapColonies/export-management/compare/v1.6.4...v1.4.0) (2024-05-26)


### Features

* add get tasks and task by id api ([c4f65b6](https://github.com/MapColonies/export-management/commit/c4f65b61c96e04b7bbe5c5f18df3d33ce010c298))
* added base sql schema builder ([0f1dc26](https://github.com/MapColonies/export-management/commit/0f1dc2609a162e390cd3fb37152ce4719fcc3325))
* added connection manager and base repository ([40e3e1f](https://github.com/MapColonies/export-management/commit/40e3e1f90a61a60f3fc0d4c25f352b4f0bfa0f5e))
* added full schema sql file ([d0afee5](https://github.com/MapColonies/export-management/commit/d0afee540b3111f3c4ebd91ddbac669ea8ea5354))
* added typeorm entities ([d6539d7](https://github.com/MapColonies/export-management/commit/d6539d7cf2cb155b0f5d0dfa6d35a3b7fc1d7a40))
* Infra nginx opala + jwt payload sub support (MAPCO-3998) (MAPCO-4010) ([#16](https://github.com/MapColonies/export-management/issues/16)) ([4454b49](https://github.com/MapColonies/export-management/commit/4454b4914d0d2134b9728cdcf14bd8e9868481a3)), closes [#21](https://github.com/MapColonies/export-management/issues/21)


### Bug Fixes

* adapt db fields to openapi definitions ([06d6f0d](https://github.com/MapColonies/export-management/commit/06d6f0d37f05f9dba392b2725ab27cccddeb4fd7))
* added max task number config ([133ab57](https://github.com/MapColonies/export-management/commit/133ab570b0b8603341522930f4161c06baac3618))
* added more infomation about created task ([5833755](https://github.com/MapColonies/export-management/commit/58337556edef69f149fb9fd454668e9f3ade34cf))
* added postgis installation step if not exists ([f5a54b8](https://github.com/MapColonies/export-management/commit/f5a54b8fa6957d941f9b09b847db04ae74d9f23c))
* added postgis installation step if not exists ([7005ad2](https://github.com/MapColonies/export-management/commit/7005ad2637b164fca92f5a0ed74bc228673744c2))
* artifact type import source ([2449860](https://github.com/MapColonies/export-management/commit/24498601db23a5a23fb621f1833a94b0afdf324c))
* disabled sync by default ([cf95c45](https://github.com/MapColonies/export-management/commit/cf95c45fcb0a5633bdc4d1f97098dbf7c7c56ea5))
* fixed db connection and tests ([d1b9a63](https://github.com/MapColonies/export-management/commit/d1b9a63f6a95d1f1e9c31e777c6b5ddd326e40c5))
* lint errors ([d5d6cac](https://github.com/MapColonies/export-management/commit/d5d6cacce492685d845ce32c56c832bf767007be))
* openapi schemas + openapi integration test + helm ([4355e6e](https://github.com/MapColonies/export-management/commit/4355e6ef99f83ee2e88d51e8e8c3a6fd3abd0515))
* openapi schemas typeorm types + tests ([25da376](https://github.com/MapColonies/export-management/commit/25da376ef4a334589a53f9674da540b3fd8b6187))
* pr issues ([0f99990](https://github.com/MapColonies/export-management/commit/0f99990104e3a0fda169788589c2ff0401e4994d))
* pr issues ([38fba73](https://github.com/MapColonies/export-management/commit/38fba73843c793f955ff1c86b73068f2166b5fc0))
* pr issues ([b1832ee](https://github.com/MapColonies/export-management/commit/b1832ee62ba89ce7d468d2e8007b28b9e3c404bd))
* pr issues ([70c4510](https://github.com/MapColonies/export-management/commit/70c4510144ae7116ab8b76c7f3f0eb2de6e4a64d))
* pr issues ([2d831a6](https://github.com/MapColonies/export-management/commit/2d831a65ec21eeef3e54a125ac175b3e1433db55))
* removed default collate ([076c94c](https://github.com/MapColonies/export-management/commit/076c94cc662847094b38e163749d3ca9eb8f0c51))
* removed logs ([3745711](https://github.com/MapColonies/export-management/commit/37457118c96e52fda9f8f583738c3f7355a2d4a3))
* test ([9ef7310](https://github.com/MapColonies/export-management/commit/9ef7310519af7fea6261b1db14093c3ebe8b4355))

## [1.3.0](https://github.com/MapColonies/export-management/compare/v1.6.4...v1.3.0) (2024-05-26)


### Features

* add get tasks and task by id api ([c4f65b6](https://github.com/MapColonies/export-management/commit/c4f65b61c96e04b7bbe5c5f18df3d33ce010c298))
* added base sql schema builder ([0f1dc26](https://github.com/MapColonies/export-management/commit/0f1dc2609a162e390cd3fb37152ce4719fcc3325))
* added connection manager and base repository ([40e3e1f](https://github.com/MapColonies/export-management/commit/40e3e1f90a61a60f3fc0d4c25f352b4f0bfa0f5e))
* added full schema sql file ([d0afee5](https://github.com/MapColonies/export-management/commit/d0afee540b3111f3c4ebd91ddbac669ea8ea5354))
* added typeorm entities ([d6539d7](https://github.com/MapColonies/export-management/commit/d6539d7cf2cb155b0f5d0dfa6d35a3b7fc1d7a40))
* Infra nginx opala + jwt payload sub support (MAPCO-3998) (MAPCO-4010) ([#16](https://github.com/MapColonies/export-management/issues/16)) ([4454b49](https://github.com/MapColonies/export-management/commit/4454b4914d0d2134b9728cdcf14bd8e9868481a3)), closes [#21](https://github.com/MapColonies/export-management/issues/21)


### Bug Fixes

* adapt db fields to openapi definitions ([06d6f0d](https://github.com/MapColonies/export-management/commit/06d6f0d37f05f9dba392b2725ab27cccddeb4fd7))
* added max task number config ([133ab57](https://github.com/MapColonies/export-management/commit/133ab570b0b8603341522930f4161c06baac3618))
* added more infomation about created task ([5833755](https://github.com/MapColonies/export-management/commit/58337556edef69f149fb9fd454668e9f3ade34cf))
* added postgis installation step if not exists ([f5a54b8](https://github.com/MapColonies/export-management/commit/f5a54b8fa6957d941f9b09b847db04ae74d9f23c))
* added postgis installation step if not exists ([7005ad2](https://github.com/MapColonies/export-management/commit/7005ad2637b164fca92f5a0ed74bc228673744c2))
* artifact type import source ([2449860](https://github.com/MapColonies/export-management/commit/24498601db23a5a23fb621f1833a94b0afdf324c))
* disabled sync by default ([cf95c45](https://github.com/MapColonies/export-management/commit/cf95c45fcb0a5633bdc4d1f97098dbf7c7c56ea5))
* fixed db connection and tests ([d1b9a63](https://github.com/MapColonies/export-management/commit/d1b9a63f6a95d1f1e9c31e777c6b5ddd326e40c5))
* lint errors ([d5d6cac](https://github.com/MapColonies/export-management/commit/d5d6cacce492685d845ce32c56c832bf767007be))
* openapi schemas + openapi integration test + helm ([4355e6e](https://github.com/MapColonies/export-management/commit/4355e6ef99f83ee2e88d51e8e8c3a6fd3abd0515))
* openapi schemas typeorm types + tests ([25da376](https://github.com/MapColonies/export-management/commit/25da376ef4a334589a53f9674da540b3fd8b6187))
* pr issues ([0f99990](https://github.com/MapColonies/export-management/commit/0f99990104e3a0fda169788589c2ff0401e4994d))
* pr issues ([38fba73](https://github.com/MapColonies/export-management/commit/38fba73843c793f955ff1c86b73068f2166b5fc0))
* pr issues ([b1832ee](https://github.com/MapColonies/export-management/commit/b1832ee62ba89ce7d468d2e8007b28b9e3c404bd))
* pr issues ([70c4510](https://github.com/MapColonies/export-management/commit/70c4510144ae7116ab8b76c7f3f0eb2de6e4a64d))
* pr issues ([2d831a6](https://github.com/MapColonies/export-management/commit/2d831a65ec21eeef3e54a125ac175b3e1433db55))
* removed default collate ([076c94c](https://github.com/MapColonies/export-management/commit/076c94cc662847094b38e163749d3ca9eb8f0c51))
* removed logs ([3745711](https://github.com/MapColonies/export-management/commit/37457118c96e52fda9f8f583738c3f7355a2d4a3))
* test ([9ef7310](https://github.com/MapColonies/export-management/commit/9ef7310519af7fea6261b1db14093c3ebe8b4355))

## [1.2.0](https://github.com/MapColonies/export-management/compare/v1.6.4...v1.2.0) (2024-05-26)


### Features

* add get tasks and task by id api ([c4f65b6](https://github.com/MapColonies/export-management/commit/c4f65b61c96e04b7bbe5c5f18df3d33ce010c298))
* added base sql schema builder ([0f1dc26](https://github.com/MapColonies/export-management/commit/0f1dc2609a162e390cd3fb37152ce4719fcc3325))
* added connection manager and base repository ([40e3e1f](https://github.com/MapColonies/export-management/commit/40e3e1f90a61a60f3fc0d4c25f352b4f0bfa0f5e))
* added full schema sql file ([d0afee5](https://github.com/MapColonies/export-management/commit/d0afee540b3111f3c4ebd91ddbac669ea8ea5354))
* added typeorm entities ([d6539d7](https://github.com/MapColonies/export-management/commit/d6539d7cf2cb155b0f5d0dfa6d35a3b7fc1d7a40))
* Infra nginx opala + jwt payload sub support (MAPCO-3998) (MAPCO-4010) ([#16](https://github.com/MapColonies/export-management/issues/16)) ([4454b49](https://github.com/MapColonies/export-management/commit/4454b4914d0d2134b9728cdcf14bd8e9868481a3)), closes [#21](https://github.com/MapColonies/export-management/issues/21)


### Bug Fixes

* adapt db fields to openapi definitions ([06d6f0d](https://github.com/MapColonies/export-management/commit/06d6f0d37f05f9dba392b2725ab27cccddeb4fd7))
* added max task number config ([133ab57](https://github.com/MapColonies/export-management/commit/133ab570b0b8603341522930f4161c06baac3618))
* added more infomation about created task ([5833755](https://github.com/MapColonies/export-management/commit/58337556edef69f149fb9fd454668e9f3ade34cf))
* added postgis installation step if not exists ([f5a54b8](https://github.com/MapColonies/export-management/commit/f5a54b8fa6957d941f9b09b847db04ae74d9f23c))
* added postgis installation step if not exists ([7005ad2](https://github.com/MapColonies/export-management/commit/7005ad2637b164fca92f5a0ed74bc228673744c2))
* artifact type import source ([2449860](https://github.com/MapColonies/export-management/commit/24498601db23a5a23fb621f1833a94b0afdf324c))
* disabled sync by default ([cf95c45](https://github.com/MapColonies/export-management/commit/cf95c45fcb0a5633bdc4d1f97098dbf7c7c56ea5))
* fixed db connection and tests ([d1b9a63](https://github.com/MapColonies/export-management/commit/d1b9a63f6a95d1f1e9c31e777c6b5ddd326e40c5))
* lint errors ([d5d6cac](https://github.com/MapColonies/export-management/commit/d5d6cacce492685d845ce32c56c832bf767007be))
* openapi schemas + openapi integration test + helm ([4355e6e](https://github.com/MapColonies/export-management/commit/4355e6ef99f83ee2e88d51e8e8c3a6fd3abd0515))
* openapi schemas typeorm types + tests ([25da376](https://github.com/MapColonies/export-management/commit/25da376ef4a334589a53f9674da540b3fd8b6187))
* pr issues ([0f99990](https://github.com/MapColonies/export-management/commit/0f99990104e3a0fda169788589c2ff0401e4994d))
* pr issues ([38fba73](https://github.com/MapColonies/export-management/commit/38fba73843c793f955ff1c86b73068f2166b5fc0))
* pr issues ([b1832ee](https://github.com/MapColonies/export-management/commit/b1832ee62ba89ce7d468d2e8007b28b9e3c404bd))
* pr issues ([70c4510](https://github.com/MapColonies/export-management/commit/70c4510144ae7116ab8b76c7f3f0eb2de6e4a64d))
* pr issues ([2d831a6](https://github.com/MapColonies/export-management/commit/2d831a65ec21eeef3e54a125ac175b3e1433db55))
* removed default collate ([076c94c](https://github.com/MapColonies/export-management/commit/076c94cc662847094b38e163749d3ca9eb8f0c51))
* removed logs ([3745711](https://github.com/MapColonies/export-management/commit/37457118c96e52fda9f8f583738c3f7355a2d4a3))
* test ([9ef7310](https://github.com/MapColonies/export-management/commit/9ef7310519af7fea6261b1db14093c3ebe8b4355))

### [1.1.4](https://github.com/MapColonies/export-management/compare/v1.1.3...v1.1.4) (2023-06-25)


### Bug Fixes

* additional properties disabled ([#4](https://github.com/MapColonies/export-management/issues/4)) ([7819e20](https://github.com/MapColonies/export-management/commit/7819e207877efc6e5ee57af34e40cec6a46eed2f))
* revmoed geometry collection as feature type ([#5](https://github.com/MapColonies/export-management/issues/5)) ([9a57d4c](https://github.com/MapColonies/export-management/commit/9a57d4c3226c3a19dc0b26e47200a1fcbda011e1))

### [1.1.3](https://github.com/MapColonies/export-management/compare/v1.1.2...v1.1.3) (2023-06-14)


### Bug Fixes

* added errorReason for failed task in webhook data ([0c127f0](https://github.com/MapColonies/export-management/commit/0c127f0ab35f3d120348f7f531787b62409fd1ff))
* added errorReason for failed task in webhook data ([#3](https://github.com/MapColonies/export-management/issues/3)) ([51ab361](https://github.com/MapColonies/export-management/commit/51ab361121cd5503212fce25d313e9f252fcaede))

### [1.1.2](https://github.com/MapColonies/export-management/compare/v1.1.1...v1.1.2) (2023-06-13)


### Bug Fixes

* adapted create task response with the required fields ([#2](https://github.com/MapColonies/export-management/issues/2)) ([e6f02b7](https://github.com/MapColonies/export-management/commit/e6f02b7b7006901fdfb61e2983098e23a269d7cf))
* lint issues ([188de58](https://github.com/MapColonies/export-management/commit/188de5815853250eebea750678e02154f352d404))

### [1.1.1](https://github.com/MapColonies/export-management/compare/v1.1.0...v1.1.1) (2023-06-12)


### Bug Fixes

* datetime naming ([fdc6cd4](https://github.com/MapColonies/export-management/commit/fdc6cd4f6dfa687c0fa31bee3a1e1abf347fb01c))

## 1.1.0 (2023-06-11)


### Features

* added openApi defenitions ([#1](https://github.com/MapColonies/export-management/issues/1)) ([04f49d1](https://github.com/MapColonies/export-management/commit/04f49d1c984c8ad63f4035c5753b3262b3ae6a0b))
