import gsap from "gsap";

export function animateCan1(can) {

    // Check if we are on a mobile screen (less than 768px)
    const isMobile = window.innerWidth <= 768;

    const target = {
        position: {
            x: isMobile ? -0.42 : -0.35,
            y: isMobile ? 0.75 : 0.7,
            z: 0.22
        },
        rotation: { x: 0.07, y: 3.2, z: 0.6 },
        scale: isMobile ? 1 : 1.5
    };

    const start = {
        x: -5,
        y: 0.7,
        z: 0.22,
    };

    const state = {
        x: start.x,
        y: start.y,
        z: start.z
    };

    const radius = 0.33;

    can.position.set(
        start.x,
        start.y,
        start.z,
    );

    can.rotation.set(
        Math.PI / 2,
        0,
        0
    );

    can.scale.setScalar(
        target.scale
    );

    const tl = gsap.timeline();

    tl.to(state, {

        x: target.position.x,
        y: target.position.y,

        duration: 2.5,

        ease: "expo.out",

        onUpdate: () => {

            const dx =
                state.x - start.x;

            const dy =
                state.y - start.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            can.position.x = state.x;
            can.position.y = state.y;

            can.rotation.y =-Math.cos(distance / radius);
        }

    });

    tl.to(can.rotation, {
        z:final => -target.rotation.z,
        x: target.rotation.x,
        y:0,

        duration: 1.5,
        ease: "bounce.out"
    });

    return tl;
}