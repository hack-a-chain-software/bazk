cd ../phase2-bn254/powersoftau
cargo build --release --bin new_constrained
cargo build --release --bin compute_constrained
cargo build --release --bin verify_transform_constrained
cargo build --release --bin beacon_constrained
cargo build --release --bin prepare_phase2

mkdir -p ../../gramine/dist/bin/
cp target/release/new_constrained ../../gramine/dist/bin
cp target/release/compute_constrained ../../gramine/dist/bin
cp target/release/verify_transform_constrained ../../gramine/dist/bin
cp target/release/beacon_constrained ../../gramine/dist/bin
cp target/release/prepare_phase2 ../../gramine/dist/bin

cd ../phase2

cargo build --release --bin new
cargo build --release --bin contribute
cargo build --release --bin verify_contribution

cp target/release/new ../../gramine/dist/bin
cp target/release/contribute ../../gramine/dist/bin
cp target/release/verify_contribution ../../gramine/dist/bin