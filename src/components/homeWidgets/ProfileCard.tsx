import Image from "next/image";
import { PERSONAL_INFO } from "../personal-data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

export default function ProfileCard() {
	return (
		<div className="card bg-base-200 shadow-2xl h-full border border-base-300 overflow-hidden relative">
			{/* BACKDROP */}
			<div className="absolute inset-0 z-0">
				<Image
					src="/backdrop.svg"
					alt="Backdrop"
					fill
					className="object-cover"
					priority
				/>

				{/* 🔑 DARK SCRIM FOR READABILITY */}
				<div
					className="
          absolute inset-0
          bg-gradient-to-b
          from-black/30 via-black/20 to-black/30
        "
				/>
			</div>

			{/* CONTENT */}
			<div className="card-body relative z-10 items-center text-center text-white">
				{/* AVATAR */}
				<div className="avatar mt-6 relative">
					{/* Soft halo background */}
					<div
						className="
    absolute inset-0
    rounded-full
    bg-white/10
    blur-xl
    scale-110
  "
					/>

					{/* Avatar container */}
					<div
						className="
    relative
    w-60 h-60
    rounded-full
    bg-black/50
    backdrop-blur-md
    ring-4 ring-primary
    shadow-xl
    flex items-center justify-center
  "
					>
						<Image
							src="/my.png"
							alt="Profile"
							width={160}
							height={160}
							className="rounded-full"
							priority
						/>
					</div>
				</div>

				{/* NAME */}
				<h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight drop-shadow-lg">
					{PERSONAL_INFO.name}
				</h2>

				{/* ROLE — higher contrast */}
				<span
					className="
          mt-1 px-4 py-1 rounded-full
          text-xs tracking-widest uppercase font-semibold
          bg-primary/90 text-primary-content
        "
				>
					{PERSONAL_INFO.role}
				</span>

				{/* CONTACT INFO */}
				<div className="mt-4 flex flex-col sm:flex-row gap-3">
					<span
						className="
            flex items-center gap-2 px-4 py-2
            rounded-lg bg-black/40
            backdrop-blur-md border border-white/10
          "
					>
						<FontAwesomeIcon icon={faMapMarkerAlt} />
						<span className="text-sm">{PERSONAL_INFO.location}</span>
					</span>

					<span
						className="
            flex items-center gap-2 px-4 py-2
            rounded-lg bg-black/40
            backdrop-blur-md border border-white/10
          "
					>
						<FontAwesomeIcon icon={faEnvelope} />
						<span className="text-sm">{PERSONAL_INFO.email}</span>
					</span>
				</div>

				{/* BIO — readable glass card */}
				<div
					className="
          mt-4 max-w-prose
          rounded-2xl p-6
          bg-black/45 backdrop-blur-lg
          border border-white/10
        "
				>
					<p
						className="
            text-sm sm:text-base
            leading-relaxed
            text-white/95
          "
					>
						{PERSONAL_INFO.bio}
					</p>
				</div>

				{/* CTA */}
				<div className="mt-4">
					<a
						href="mailto:pradyot.o.c@gmail.com"
						className="
              btn btn-primary
              px-8 shadow-lg
              hover:scale-105 transition-transform
            "
					>
						<FontAwesomeIcon icon={faEnvelope} />
						Get in Touch
					</a>
				</div>
			</div>
		</div>
	);
}
