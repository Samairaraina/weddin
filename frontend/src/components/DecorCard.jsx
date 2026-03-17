function DecorCard({ image, selected, onToggle, onPredict }) {
  return (
    <article className="panel overflow-hidden">
      <img src={image.thumbnail_url} alt={image.function_type || "Decor inspiration"} className="h-56 w-full object-cover" />
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
          <span className="rounded-full bg-maroon/10 px-3 py-1 text-maroon">{image.function_type || "Unlabelled"}</span>
          <span className="rounded-full bg-gold/10 px-3 py-1 text-gold">{image.complexity || "Mid"}</span>
          <span className="rounded-full bg-sage/10 px-3 py-1 text-sage">{image.style || "Traditional"}</span>
        </div>
        <p className="text-sm text-black/60">
          {image.cost_min && image.cost_max ? `Rs ${image.cost_min.toLocaleString()} - Rs ${image.cost_max.toLocaleString()}` : "No labelled range yet"}
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => onPredict(image.id)}>
            Predict Cost
          </button>
          <button className={`flex-1 rounded-full px-5 py-3 font-semibold ${selected ? "bg-gold text-white" : "bg-ink text-white"}`} onClick={() => onToggle(image)}>
            {selected ? "Shortlisted" : "Shortlist"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default DecorCard;
