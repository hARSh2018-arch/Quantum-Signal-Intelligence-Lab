import numpy as np
import matplotlib.pyplot as plt
from matplotlib.widgets import Slider


fs = 2000
duration = 1.0
t = np.arange(0, duration, 1 / fs)

message_frequency = 5.0
carrier_frequency = 120.0


def lowpass(signal, window_size=25):
    kernel = np.ones(window_size) / window_size
    return np.convolve(signal, kernel, mode="same")


def compute_signals(noise_level, frequency_offset, distortion_amount):
    message = np.sin(2 * np.pi * message_frequency * t)

    distortion = distortion_amount * np.sin(2 * np.pi * 0.5 * t)
    received_phase = 2 * np.pi * (carrier_frequency + distortion) * t
    received_signal = (1 + 0.5 * message) * np.cos(received_phase)

    received_signal += noise_level * np.random.randn(len(t))

    local_oscillator = np.cos(2 * np.pi * (carrier_frequency + frequency_offset) * t)

    mixed_signal = received_signal * local_oscillator
    demodulated_signal = lowpass(mixed_signal)

    frequencies = np.fft.rfftfreq(len(t), d=1 / fs)
    received_spectrum = np.abs(np.fft.rfft(received_signal))
    lo_spectrum = np.abs(np.fft.rfft(local_oscillator))

    return (
        received_signal,
        local_oscillator,
        demodulated_signal,
        frequencies,
        received_spectrum,
        lo_spectrum,
    )


initial_noise = 0.10
initial_offset = 2.0
initial_distortion = 1.0

(
    received_signal,
    local_oscillator,
    demodulated_signal,
    frequencies,
    received_spectrum,
    lo_spectrum,
) = compute_signals(initial_noise, initial_offset, initial_distortion)


fig, axes = plt.subplots(3, 1, figsize=(12, 10))
plt.subplots_adjust(left=0.10, bottom=0.22, hspace=0.45)


received_line, = axes[0].plot(t, received_signal, label="Received Signal", color="tab:blue")
lo_line, = axes[0].plot(t, local_oscillator, label="Local Oscillator", color="tab:orange", alpha=0.8)
axes[0].set_title("Simulated Signals")
axes[0].set_xlabel("Time (s)")
axes[0].set_ylabel("Amplitude")
axes[0].legend()
axes[0].grid(True)

demod_line, = axes[1].plot(t, demodulated_signal, color="tab:green", label="Demodulated Output")
axes[1].set_title("Demodulated Signal")
axes[1].set_xlabel("Time (s)")
axes[1].set_ylabel("Amplitude")
axes[1].legend()
axes[1].grid(True)

received_fft_line, = axes[2].plot(frequencies, received_spectrum, label="Received Spectrum", color="tab:blue")
lo_fft_line, = axes[2].plot(frequencies, lo_spectrum, label="LO Spectrum", color="tab:orange")
axes[2].set_title("Frequency Spectrum (FFT)")
axes[2].set_xlabel("Frequency (Hz)")
axes[2].set_ylabel("Magnitude")
axes[2].set_xlim(0, 300)
axes[2].legend()
axes[2].grid(True)


noise_ax = plt.axes([0.10, 0.12, 0.80, 0.03])
offset_ax = plt.axes([0.10, 0.08, 0.80, 0.03])
distortion_ax = plt.axes([0.10, 0.04, 0.80, 0.03])

noise_slider = Slider(noise_ax, "Noise Level", 0.0, 0.5, valinit=initial_noise)
offset_slider = Slider(offset_ax, "Freq Offset (Hz)", -10.0, 10.0, valinit=initial_offset)
distortion_slider = Slider(distortion_ax, "Freq Distortion", 0.0, 5.0, valinit=initial_distortion)


def update(_):
    (
        next_received_signal,
        next_local_oscillator,
        next_demodulated_signal,
        next_frequencies,
        next_received_spectrum,
        next_lo_spectrum,
    ) = compute_signals(
        noise_slider.val,
        offset_slider.val,
        distortion_slider.val,
    )

    received_line.set_ydata(next_received_signal)
    lo_line.set_ydata(next_local_oscillator)
    demod_line.set_ydata(next_demodulated_signal)

    received_fft_line.set_xdata(next_frequencies)
    received_fft_line.set_ydata(next_received_spectrum)
    lo_fft_line.set_xdata(next_frequencies)
    lo_fft_line.set_ydata(next_lo_spectrum)

    axes[0].relim()
    axes[0].autoscale_view()
    axes[1].relim()
    axes[1].autoscale_view()
    axes[2].relim()
    axes[2].autoscale_view()
    axes[2].set_xlim(0, 300)

    fig.canvas.draw_idle()


noise_slider.on_changed(update)
offset_slider.on_changed(update)
distortion_slider.on_changed(update)

plt.show()
