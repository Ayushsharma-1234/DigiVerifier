package com.digiverifier.util;

import com.digiverifier.enums.InstrumentCategory;
import com.digiverifier.enums.RoutedTo;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.Map;

public class FeeCalculator {

    public static final Map<InstrumentCategory, BigDecimal> FIFTH_SCHEDULE_FEES = new EnumMap<>(InstrumentCategory.class);

    static {
        // Populating government fees for GATC categories (Mock values representing actual schedules)
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.WATER_METER, new BigDecimal("25.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.SPHYGMOMANOMETER, new BigDecimal("50.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.CLINICAL_THERMOMETER, new BigDecimal("20.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.RAIL_WEIGHBRIDGE, new BigDecimal("2500.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.TAPE_MEASURE, new BigDecimal("10.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.NON_AUTO_CLASS_III, new BigDecimal("200.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.NON_AUTO_CLASS_IIII, new BigDecimal("150.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.LOAD_CELL, new BigDecimal("300.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.BEAM_SCALE, new BigDecimal("100.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.COUNTER_MACHINE, new BigDecimal("100.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.WEIGHT, new BigDecimal("10.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.LPG_DISPENSER, new BigDecimal("1000.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.CNG_DISPENSER, new BigDecimal("1500.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.VOLUMETRIC, new BigDecimal("50.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.TAXI_METER, new BigDecimal("250.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.FLOW_METER, new BigDecimal("500.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.AUTOMATIC_WEIGHING, new BigDecimal("1200.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.LINEAR_MEASURING, new BigDecimal("50.00"));
        FIFTH_SCHEDULE_FEES.put(InstrumentCategory.CAPACITY_MEASURE, new BigDecimal("50.00"));
    }

    public static BigDecimal calculateFee(InstrumentCategory category, RoutedTo routedTo) {
        if (routedTo == RoutedTo.GATC) {
            return FIFTH_SCHEDULE_FEES.getOrDefault(category, new BigDecimal("100.00"));
        } else {
            // LMO: Placeholder for state-wise schedule (to be integrated in phase 2)
            return new BigDecimal("100.00");
        }
    }
}
