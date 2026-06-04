import gsap from "gsap";

export function animateCan3(can) {
    const isMobile = window.innerWidth <= 768;

    const target = {
        position: {
            x: isMobile ? 0.25 : 1.35,
            y: isMobile ? 1.0 : 1,
            z: 0.12
        },
        rotation: { x: 6.283185, y: 2.8, z: 3.14 },
        scale: isMobile ? 1 : 1.5
    };

    const start = {
        x: 0,
        y: 4
    };

    const state = {
        x: start.x,
        y: start.y
    };

    const radius = 0.33;

    can.position.set(
        start.x,
        start.y,
        target.position.z
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
        ease: "power3.out",
        onUpdate: () => {
            const dx = state.x - start.x;
            const dy = state.y - start.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            can.position.x = state.x;
            can.position.y = state.y;
            can.rotation.y = -Math.sin(distance / radius);
        }
    });

    tl.to(can.rotation, {
        x: 0,
        y: final => -target.rotation.y,
        z: 0,
        duration: 1.25,
        ease: "bounce.out"
    });

    return tl;
}