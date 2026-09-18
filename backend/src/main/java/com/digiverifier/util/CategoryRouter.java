package com.digiverifier.util;

import com.digiverifier.enums.InstrumentCategory;
import com.digiverifier.enums.RoutedTo;

import java.util.EnumSet;
import java.util.Set;

public class CategoryRouter {

    public static final Set<InstrumentCategory> GATC_CATEGORIES = EnumSet.of(
            InstrumentCategory.WATER_METER,
            InstrumentCategory.SPHYGMOMANOMETER,
            InstrumentCategory.CLINICAL_THERMOMETER,
            InstrumentCategory.RAIL_WEIGHBRIDGE,
            InstrumentCategory.TAPE_MEASURE,
            InstrumentCategory.NON_AUTO_CLASS_III,
            InstrumentCategory.NON_AUTO_CLASS_IIII,
            InstrumentCategory.LOAD_CELL,
            InstrumentCategory.BEAM_SCALE,
            InstrumentCategory.COUNTER_MACHINE,
            InstrumentCategory.WEIGHT,
            InstrumentCategory.LPG_DISPENSER,
            InstrumentCategory.CNG_DISPENSER,
            InstrumentCategory.VOLUMETRIC,
            InstrumentCategory.TAXI_METER,
            InstrumentCategory.FLOW_METER,
            InstrumentCategory.AUTOMATIC_WEIGHING,
            InstrumentCategory.LINEAR_MEASURING,
            InstrumentCategory.CAPACITY_MEASURE
            // Other categories for GATC as per Legal Metrology Act
    );

    public static RoutedTo route(InstrumentCategory category) {
        if (GATC_CATEGORIES.contains(category)) {
            return RoutedTo.GATC;
        }
        return RoutedTo.LMO;
    }
}
