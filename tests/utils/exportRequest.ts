/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/naming-convention */
import { CreateExportTaskRequest, TaskEvent, TaskParameters } from "@map-colonies/export-interfaces";
import { Domain } from "@map-colonies/types";

export const exportRequest: CreateExportTaskRequest<TaskParameters> = {
    ROI: {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "Polygon",
                    coordinates: [
                        [
                            [
                                34.82836896556114,
                                32.03918441418732
                            ],
                            [
                                34.81210152170695,
                                32.03918441418732
                            ],
                            [
                                34.81210152170695,
                                32.02539369969462
                            ],
                            [
                                34.82836896556114,
                                32.02539369969462
                            ],
                            [
                                34.82836896556114,
                                32.03918441418732
                            ]
                        ]
                    ]
                }
            }
        ]
    },
    catalogRecordID: 'de0dab85-6bc5-4b9f-9a64-9e61627d82d9',
    artifactCRS: '4326',
    domain: Domain.RASTER,
    webhook: [{ url: 'http://localhost:8080', events: [TaskEvent.TASK_COMPLETED] }],
};