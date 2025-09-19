import { bigNumDecimal } from "./util.js";

const minSpeedPrice = 0.01;

function estimatePrice(energy, minutes) {
    if (!(energy > 0) || !(minutes > 0)) {
        throw new Error("Energy and minutes must be positive numbers");
    }
    const samples = [
        { energy: 65000, minutes: 10, price: 1.00 },
        { energy: 131000, minutes: 10, price: 2.02 },
        { energy: 650000, minutes: 60, price: 10.35 },
        { energy: 1000000, minutes: 1440, price: 59.71 },
        { energy: 1000000, minutes: 4320, price: 119.43 },
    ];
    for (const s of samples) {
        if (s.energy === energy && s.minutes === minutes) {
            return {
                price: s.price,
                unitPrice: s.price / (s.energy * s.minutes),
                usedSamples: [s]
            };
        }
    }
    const eps = 1e-12;
    const prepared = samples.map(s => {
        const unit = s.price / (s.energy * s.minutes);
        return {
            ...s,
            unit
        };
    });
    const logTargetE = Math.log(energy);
    const logTargetM = Math.log(minutes);
    const p = 2;
    const weights = prepared.map(s => {
        const d2 = Math.pow(logTargetE - Math.log(s.energy), 2) + Math.pow(logTargetM - Math.log(s.minutes), 2);
        const w = 1 / (Math.pow(d2 + eps, p / 2));
        return w;
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0) + eps;
    let unitSum = 0;
    for (let i = 0; i < prepared.length; i++) {
        unitSum += prepared[i].unit * weights[i];
    }
    const unitAvg = unitSum / totalWeight;
    const price = unitAvg * energy * minutes;
    return Math.max(minSpeedPrice, bigNumDecimal(price));
}

function estimateBandwidthPrice(bandwidth, minutes) {
    if (!(bandwidth > 0) || !(minutes > 0)) {
        throw new Error("Bandwidth and minutes must be positive numbers");
    }
    const samples = [
        { bandwidth: 10000, minutes: 60, price: 0.92 },
        { bandwidth: 100000, minutes: 60, price: 3.26 },
        { bandwidth: 100000, minutes: 1440, price: 8.61 },
        { bandwidth: 100000, minutes: 4320, price: 20.32 },
        { bandwidth: 100000, minutes: 21600, price: 104.69 },
    ];
    const prepared = samples.map(s => ({
        ...s,
        unit: s.price / (s.bandwidth * s.minutes)
    }));
    const eps = 1e-12;
    const logB = Math.log(bandwidth);
    const logM = Math.log(minutes);
    let weightSum = 0, unitSum = 0;
    for (const s of prepared) {
        const d2 = Math.pow(logB - Math.log(s.bandwidth), 2) + Math.pow(logM - Math.log(s.minutes), 2);
        const w = 1 / (d2 + eps);
        unitSum += s.unit * w;
        weightSum += w;
    }
    const unitPrice = unitSum / weightSum;
    const price = unitPrice * bandwidth * minutes;
    return Math.max(minSpeedPrice, bigNumDecimal(price));
}

export const getResourceRentPrice = (type, amount, rentTime) => {
    const rentTimeRent = rentTime / 60;
    switch (type) {
        case "ENERGY":
            return estimatePrice(amount, rentTimeRent);
        case "BANDWIDTH":
            return estimateBandwidthPrice(amount, rentTimeRent);
    }
}
